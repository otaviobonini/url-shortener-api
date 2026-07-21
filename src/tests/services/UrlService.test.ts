import { describe, it, expect, jest, test,beforeEach } from "@jest/globals";
import { Prisma } from "@prisma/client";

jest.mock("../../database/redis.js");
jest.mock("../../database/prisma.js");
jest.mock("nanoid", () => ({
  nanoid: () => "abc123",
}));

import { redis } from "../../database/redis.js";
import { prisma } from "../../database/prisma.js";
import UrlService from "../../services/UrlService.js";
import {
  FakeUrl,
  FakeUrlCollision,
  FakeUrlExpired,
  FakeUrlIncrement,
  FakeUrlList,
} from "../factories/UrlFactory.js";

const prismaMock = prisma.url as jest.Mocked<typeof prisma.url>;
const redisMock = redis as jest.Mocked<typeof redis>;

describe("--Url Service test--", () => {
  let service: UrlService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UrlService();
  });
  test("Create short URL sucessfully", async () => {
    prismaMock.findUnique.mockResolvedValue(null);
    prismaMock.create.mockResolvedValue(FakeUrl);
    const result = await service.createShortUrl(FakeUrl);
    expect(result).toEqual(FakeUrl);
  });
  test("Should retry on P2002 collision", async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "5.0.0" },
    );
    prismaMock.create
      .mockRejectedValueOnce(p2002) // 1ª tentativa: colisão
      .mockResolvedValueOnce(FakeUrl); // 2ª tentativa: sucesso
    const result = await service.createShortUrl(FakeUrl);
    expect(result).toEqual(FakeUrl);
    expect(prismaMock.create).toHaveBeenCalledTimes(2);
  });

  test("Should delete url", async () => {
    prismaMock.findFirst.mockResolvedValue({
      hashedUrl: "abc123",
      id: 0,
      userId: 0,
      originalUrl: "",
      counter: 0,
      expires: null,
      createdAt: new Date(),
    });
    prismaMock.deleteMany.mockResolvedValue({ count: 1 });
    const result = await service.deleteShortUrl({ userId: 1, urlId: 1 });
    expect(result).toEqual({ count: 1 });
  });
  test("Should fail to delete url if url not found or wrong user", async () => {
    prismaMock.deleteMany.mockResolvedValue({ count: 0 });
    const result = service.deleteShortUrl({ userId: 2, urlId: 1 });
    await expect(result).rejects.toThrow("URL not found or Unauthorized");
  });
  test("Should get user URLS with pagination metadata", async () => {
    prismaMock.findMany.mockResolvedValue(FakeUrlList);
    prismaMock.count.mockResolvedValue(42);
    const result = await service.getUserUrls({ userId: 1 });
    // total comes from count(), not from the page size — 42 records, 10 per page
    expect(result).toEqual({
      data: FakeUrlList,
      page: 1,
      limit: 10,
      total: 42,
    });
  });
  test("Should count using the same filter as the page query", async () => {
    prismaMock.findMany.mockResolvedValue(FakeUrlList);
    prismaMock.count.mockResolvedValue(3);
    await service.getUserUrls({ userId: 7, page: 2, limit: 5 });
    expect(prismaMock.count).toHaveBeenCalledWith({ where: { userId: 7 } });
    expect(prismaMock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 7 }, take: 5, skip: 5 }),
    );
  });
  test("Should get url for redirect and increment counter", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUrl);
    prismaMock.update.mockResolvedValue(FakeUrlIncrement);
    const result = await service.getUrlForRedirect("abc123");
    expect(result).toEqual(FakeUrlIncrement);
  });
  test("Should fail if url not found", async () => {
    prismaMock.findUnique.mockResolvedValue(null);
    const result = service.getUrlForRedirect("abc123");
    await expect(result).rejects.toThrow("URL not found");
  });
  test("Cache hit should serve the redirect without touching the database", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({ originalUrl: FakeUrl.originalUrl, expires: null }),
    );
    prismaMock.update.mockResolvedValue(FakeUrlIncrement);

    const result = await service.getUrlForRedirect(FakeUrl.hashedUrl);

    expect(result).toEqual({ originalUrl: FakeUrl.originalUrl });
    expect(prismaMock.findUnique).not.toHaveBeenCalled();
  });

  test("Cache hit should still count the click", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({ originalUrl: FakeUrl.originalUrl, expires: null }),
    );
    prismaMock.update.mockResolvedValue(FakeUrlIncrement);

    await service.getUrlForRedirect(FakeUrl.hashedUrl);

    expect(prismaMock.update).toHaveBeenCalledWith({
      where: { hashedUrl: FakeUrl.hashedUrl },
      data: { counter: { increment: 1 } },
    });
  });

  test("Cache hit should still redirect if the counter update fails", async () => {
    // the counter update is fire-and-forget; without a .catch() a failure here
    // becomes an unhandled rejection and kills the process on Node 18+
    redisMock.get.mockResolvedValue(
      JSON.stringify({ originalUrl: FakeUrl.originalUrl, expires: null }),
    );
    prismaMock.update.mockRejectedValue(new Error("record not found"));

    await expect(
      service.getUrlForRedirect(FakeUrl.hashedUrl),
    ).resolves.toEqual({ originalUrl: FakeUrl.originalUrl });
  });

  test("Should fall back to the database when redis is down", async () => {
    redisMock.get.mockRejectedValue(new Error("ECONNREFUSED"));
    prismaMock.findUnique.mockResolvedValue(FakeUrl);
    prismaMock.update.mockResolvedValue(FakeUrlIncrement);

    const result = await service.getUrlForRedirect(FakeUrl.hashedUrl);

    expect(result).toEqual(FakeUrlIncrement);
  });

  test("Cache miss should populate the cache with a TTL", async () => {
    redisMock.get.mockResolvedValue(null);
    prismaMock.findUnique.mockResolvedValue(FakeUrl);
    prismaMock.update.mockResolvedValue(FakeUrlIncrement);

    await service.getUrlForRedirect(FakeUrl.hashedUrl);

    expect(redisMock.set).toHaveBeenCalledWith(
      `url:${FakeUrl.hashedUrl}`,
      expect.any(String),
      expect.any(String),
      expect.any(Number),
    );
  });

  test("Deleting a url should invalidate its cache entry", async () => {
    prismaMock.findFirst.mockResolvedValue({
      hashedUrl: FakeUrl.hashedUrl,
      originalUrl: "",
      id: 0,
      counter: 0,
      expires: null,
      createdAt: new Date(),
      userId: 0
    });
    prismaMock.deleteMany.mockResolvedValue({ count: 1 });

    await service.deleteShortUrl({ userId: 1, urlId: 1 });

    expect(redisMock.del).toHaveBeenCalledWith(`url:${FakeUrl.hashedUrl}`);
  });

  test("Should fail and delete if url expired", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUrlExpired);
    prismaMock.delete.mockResolvedValue(FakeUrlExpired);
    const result = service.getUrlForRedirect("abc123");
    await expect(result).rejects.toThrow(
      "URL has expired and has been deleted",
    );
    expect(prismaMock.delete).toHaveBeenCalled();
  });
});
