import request from "supertest";
import app from "../../app/app.js";
import { prisma } from "../../database/prisma.js";
import {jest, describe, beforeEach, test, expect} from "@jest/globals";

jest.mock("../../database/redis.js")
jest.mock("../../database/prisma.js");
jest.mock("../../utils/rateLimit.js");
jest.mock("nanoid", () => ({
  nanoid: () => "abc12345",
}));
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedpassword" as never),
  compare: jest.fn(),
}));

import bcrypt from "bcrypt";

const prismaMock = prisma.user as jest.Mocked<typeof prisma.user>;
const refreshTokenMock = prisma.refreshToken as jest.Mocked<
  typeof prisma.refreshToken
>;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe("POST /auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid body", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "nao-é-email", password: "123" });
    expect(res.status).toBe(400);
  });

  test("should return 201 for valid registration", async () => {
    prismaMock.findUnique.mockResolvedValue(null); // email não existe
    prismaMock.create.mockResolvedValue({
      // usuário criado
      id: 1,
      email: "a@b.com",
      username: "ab",
      hashedPassword: "hashed",
      urls: [],
    } as any);

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", username: "ab", password: "123456" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      email: "a@b.com",
      username: "ab",
    });
  });

  test("should return 409 if email already exists", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      username: "ab",
      hashedPassword: "hashed",
    } as any);

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", username: "ab", password: "123456" });

    expect(res.status).toBe(409);
  });
});

describe("POST /auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid body", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nao-é-email", password: "123" });
    expect(res.status).toBe(400);
  });
  test("should return 200 and set the refresh cookie on valid login", async () => {
    bcryptMock.compare.mockResolvedValue(true as never);
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      email: "teste@gmail.com",
      username: "otgbonini",
      hashedPassword: "hashed",
    } as any);
    refreshTokenMock.create.mockResolvedValue({} as never);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "teste@gmail.com", password: "123456" });

    expect(res.status).toBe(200);
    // access token comes back in the body...
    expect(typeof res.body.token).toBe("string");
    // ...and the refresh token only ever lives in an httpOnly cookie
    expect(res.body.refreshToken).toBeUndefined();
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
    expect(cookies.some((c) => /httponly/i.test(c))).toBe(true);
  });
  test("should return 401 for non-existent email", async () => {
    bcryptMock.compare.mockResolvedValue(true as never);
    prismaMock.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "teste@gmail.com", password: "123456" });

    expect(res.status).toBe(401);
  });
  test("deve retornar 401 para senha incorreta", async () => {
    bcryptMock.compare.mockResolvedValue(false as never);
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      email: "teste@gmail.com",
      username: "otgbonini",
      hashedPassword: "hashed",
    } as any);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "teste@gmail.com", password: "654321" });

    expect(res.status).toBe(401);
  });
});

describe("POST /auth/refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 when the refresh cookie is missing", async () => {
    const res = await request(app).post("/auth/refresh");
    expect(res.status).toBe(401);
  });

  test("should rotate the refresh token and return a new access token", async () => {
    refreshTokenMock.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      hashedToken: "hashed",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    } as any);
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      email: "teste@gmail.com",
      username: "otgbonini",
      hashedPassword: "hashed",
    } as any);
    refreshTokenMock.create.mockResolvedValue({} as never);
    refreshTokenMock.delete.mockResolvedValue({} as never);

    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", ["refreshToken=some-raw-token"]);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  test("should return 401 for an unknown refresh token", async () => {
    refreshTokenMock.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", ["refreshToken=some-raw-token"]);
    expect(res.status).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should clear the refresh token and return 204", async () => {
    refreshTokenMock.deleteMany.mockResolvedValue({ count: 1 } as never);
    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", ["refreshToken=some-raw-token"]);

    expect(res.status).toBe(204);
    expect(refreshTokenMock.deleteMany).toHaveBeenCalled();
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  test("should return 204 even without a cookie", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(204);
  });
});
