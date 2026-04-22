import request from "supertest";
import app from "../../app/app.js";
import { prisma } from "../../database/prisma.js";

jest.mock("../../database/prisma.js");
jest.mock("nanoid", () => ({
  nanoid: () => "abc12345",
}));
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn(),
}));

import bcrypt from "bcrypt";

const prismaMock = prisma.user as jest.Mocked<typeof prisma.user>;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe("POST /register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar 400 para body inválido", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "nao-é-email", password: "123" });
    expect(res.status).toBe(400);
  });

  test("deve retornar 201 para registro válido", async () => {
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
      .post("/register")
      .send({ email: "a@b.com", username: "ab", password: "123456" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      email: "a@b.com",
      username: "ab",
    });
  });

  test("deve retornar 409 se email já existe", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      username: "ab",
      hashedPassword: "hashed",
    } as any);

    const res = await request(app)
      .post("/register")
      .send({ email: "a@b.com", username: "ab", password: "123456" });

    expect(res.status).toBe(409);
  });
});

describe("POST /login", () => {
  test("deve retornar 400 para body inválido", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "nao-é-email", password: "123" });
    expect(res.status).toBe(400);
  });
  test("deve retornar 200 para login válido", async () => {
    bcryptMock.compare.mockResolvedValue(true);
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      email: "teste@gmail.com",
      username: "otgbonini",
      hashedPassword: "hashed",
    } as any);
    const res = await request(app)
      .post("/login")
      .send({ email: "teste@gmail.com", password: "123456" });

    expect(res.status).toBe(200);
  });
  test("deve retornar 401 para email não existente", async () => {
    bcryptMock.compare.mockResolvedValue(true);
    prismaMock.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/login")
      .send({ email: "teste@gmail.com", password: "123456" });

    expect(res.status).toBe(401);
  });
  test("deve retornar 401 para senha incorreta", async () => {
    bcryptMock.compare.mockResolvedValue(false);
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      email: "teste@gmail.com",
      username: "otgbonini",
      hashedPassword: "hashed",
    } as any);
    const res = await request(app)
      .post("/login")
      .send({ email: "teste@gmail.com", password: "654321" });

    expect(res.status).toBe(401);
  });
});
