import { describe, it, expect, jest } from "@jest/globals";

jest.mock("../database/prisma.js", () => ({
  prisma: {
    url: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "abc12345"),
}));

import { prisma } from "../database/prisma.js";
import UrlService from "../service/UrlService.js";

const prismaMock = prisma.url as jest.Mocked<typeof prisma.url>;

describe("UrlService", () => {
  const data = new Date("2024-01-01T00:00:00.000Z");
  const expired = new Date("2023-01-01T00:00:00.000Z");
  const service = new UrlService();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should create a short URL sucessfully", async () => {
    prismaMock.create.mockResolvedValue({
      id: 1,
      userId: 1,
      originalUrl: "https://example.com",
      hashedUrl: "abc12345",
      expires: null,
      createdAt: data,
      counter: 0,
    });

    const result = await service.createShortUrl({
      userId: 1,
      originalUrl: "https://example.com",
      expires: null,
    });
    expect(result).toEqual({
      id: 1,
      userId: 1,
      originalUrl: "https://example.com",
      hashedUrl: "abc12345",
      expires: null,
      createdAt: data,
      counter: 0,
    });
  });
  test("Should throw if URL does not exist", async () => {
    prismaMock.findUnique.mockResolvedValue(null);

    await expect(
      service.deleteShortUrl({ userId: 1, urlId: 1 }),
    ).rejects.toThrow("URL not found or Unauthorized");
  });

  test("Should delete a short URL sucessfully", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      originalUrl: "",
      counter: 0,
      expires: null,
      createdAt: data,
      hashedUrl: "",
    });
    prismaMock.delete.mockResolvedValue({
      id: 1,
      userId: 1,
      originalUrl: "",
      counter: 0,
      expires: null,
      createdAt: data,
      hashedUrl: "",
    });

    expect(await service.deleteShortUrl({ userId: 1, urlId: 1 })).toEqual({
      id: 1,
      userId: 1,
      originalUrl: "",
      counter: 0,
      expires: null,
      createdAt: data,
      hashedUrl: "",
    });
  });

  test("Should get user URLs sucessfully", async () => {
    prismaMock.findMany.mockResolvedValue([
      {
        originalUrl: "",
        counter: 0,
        expires: null,
        createdAt: data,
        hashedUrl: "",
        id: 0,
        userId: 0,
      },
    ]);
    const result = await service.getUserUrls({ userId: 1, page: 1, limit: 10 });
    expect(result).toEqual([
      {
        originalUrl: "",
        counter: 0,
        expires: null,
        createdAt: data,
        hashedUrl: "",
        id: 0,
        userId: 0,
      },
    ]);
  });
  describe("getUrlForRedirect", () => {
    test("Should throw if URL does not exist", async () => {
      prismaMock.findUnique.mockResolvedValue(null);
      await expect(service.getUrlForRedirect("adasd")).rejects.toThrow(Error);
    });
    test("Should throw if URL is expired", async () => {
      prismaMock.findUnique.mockResolvedValue({
        id: 0,
        originalUrl: "",
        counter: 0,
        expires: expired,
        createdAt: data,
        hashedUrl: "",
        userId: 0,
      });
      await expect(service.getUrlForRedirect("adasd")).rejects.toThrow(Error);
    });
    test("Should return URL for redirect and increment counter", async () => {
      prismaMock.findUnique.mockResolvedValue({
        id: 0,
        originalUrl: "",
        counter: 0,
        expires: null,
        createdAt: data,
        hashedUrl: "",
        userId: 0,
      });
      prismaMock.update.mockResolvedValue({
        id: 0,
        originalUrl: "",
        counter: 1,
        expires: null,
        createdAt: data,
        hashedUrl: "",
        userId: 0,
      });
      const result = await service.getUrlForRedirect("adasd");
      expect(result).toEqual({
        id: 0,
        originalUrl: "",
        counter: 1,
        expires: null,
        createdAt: data,
        hashedUrl: "",
        userId: 0,
      });
    });
  });
  test("Should throw if database fails when creating URL", async () => {
    prismaMock.create.mockRejectedValue(new Error("DB error"));

    await expect(
      service.createShortUrl({
        userId: 1,
        originalUrl: "https://example.com",
        expires: null,
      }),
    ).rejects.toThrow("Failed to create URL");
  });
  test("Should throw if user is not the owner", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      userId: 2, // diferente
      originalUrl: "",
      counter: 0,
      expires: null,
      createdAt: data,
      hashedUrl: "",
    });

    await expect(
      service.deleteShortUrl({ userId: 1, urlId: 1 }),
    ).rejects.toThrow("URL not found or Unauthorized");
  });
  test("Should delete expired URL from database", async () => {
    prismaMock.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      originalUrl: "",
      counter: 0,
      expires: expired,
      createdAt: data,
      hashedUrl: "abc",
    });

    await expect(service.getUrlForRedirect("abc")).rejects.toThrow(
      "URL has expired and has been deleted",
    );

    expect(prismaMock.delete).toHaveBeenCalledWith({
      where: { hashedUrl: "abc" },
    });
  });
});
