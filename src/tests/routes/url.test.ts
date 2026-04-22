import request from "supertest";
import app from "../../app/app.js";
import { prisma } from "../../database/prisma.js";

import {
  FakeUrl,
  FakeUrlList,
  FakeUrlExpired,
} from "../factories/UrlFactory.js";

jest.mock("../../database/prisma.js");
jest.mock("nanoid", () => ({
  nanoid: () => "abc12345",
}));

jest.mock("../../middlewares/authMiddleware.js", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.userId = 1;
    next();
  },
}));

const prismaMock = prisma.url as jest.Mocked<typeof prisma.url>;

describe("POST /url", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid body", async () => {
    const res = await request(app).post("/url").send({ url: "not-a-url" });
    expect(res.status).toBe(400);
  });
  test("should return 201 for valid URL", async () => {
    prismaMock.findUnique.mockResolvedValue(null); // URL não existe
    prismaMock.create.mockResolvedValue(FakeUrl);
    const res = await request(app)
      .post("/url")
      .send({ url: "https://example.com" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      ...FakeUrl,
      createdAt: FakeUrl.createdAt.toISOString(),
    });
  });
  test("should return 500 if an unexpected error occurs", async () => {
    prismaMock.create.mockRejectedValue(new Error("Database error"));
    const res = await request(app)
      .post("/url")
      .send({ url: "https://example.com" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create URL" });
  });
});

describe("GET /url", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should return 200 and list of URLs", async () => {
    prismaMock.findMany.mockResolvedValue(FakeUrlList);
    const res = await request(app).get("/url");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      FakeUrlList.map((url) => ({
        ...url,
        createdAt: url.createdAt.toISOString(),
      })),
    );
  });
});

describe("DELETE /url/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should delete url and return 200  ", async () => {
    prismaMock.deleteMany.mockResolvedValue({ count: 1 });
    const res = await request(app).delete("/url/1");
    expect(res.status).toBe(200);
  });
  test("should return 403 if url not found", async () => {
    prismaMock.deleteMany.mockResolvedValue({ count: 0 });
    const res = await request(app).delete("/url/1");
    expect(res.status).toBe(403);
  });
});

describe("GET /url/:hashedUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should redirect url and return 302", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUrl);
    prismaMock.update.mockResolvedValue({ ...FakeUrl, counter: 1 });
    const res = await request(app).get(`/url/${FakeUrl.hashedUrl}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain(FakeUrl.originalUrl);
  });
  test("should delete expired url and return 410 ", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUrlExpired);
    prismaMock.delete.mockResolvedValue(FakeUrlExpired);
    const res = await request(app).get(`/url/${FakeUrl.hashedUrl}`);
    expect(res.status).toBe(410);
  });
  test("should return 404 if url not found", async () => {
    prismaMock.findUnique.mockResolvedValue(null);
    const res = await request(app).get(`/url/${FakeUrl.hashedUrl}`);
    expect(res.status).toBe(404);
  });
});
