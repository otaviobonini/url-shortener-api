import request from "supertest";
import app from "../../app/app.js";
import { prisma } from "../../database/prisma.js";

import { FakeUrl } from "../factories/UrlFactory.js";

jest.mock("../../database/prisma.js");
jest.mock("nanoid", () => ({
  nanoid: () => "abc12345",
}));

jest.mock("../../middlewares/authMiddleware.js", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 1 };
    next();
  },
}));

const prismaMock = prisma.url as jest.Mocked<typeof prisma.url>;

describe("POST /url", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar 400 para body inválido", async () => {
    const res = await request(app).post("/url").send({ url: "not-a-url" });
    expect(res.status).toBe(400);
  });
  test("deve retornar 201 para URL válida", async () => {
    prismaMock.findUnique.mockResolvedValue(null); // URL não existe
    prismaMock.create.mockResolvedValue(FakeUrl);
    const res = await request(app)
      .post("/url")
      .send({ url: "https://example.com" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(FakeUrl);
  });
});
