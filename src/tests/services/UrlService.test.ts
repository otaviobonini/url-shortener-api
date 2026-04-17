import { describe, it, expect, jest, test } from "@jest/globals";

jest.mock("../../database/prisma.js");
jest.mock("nanoid", () => ({
  nanoid: () => "abc123",
}));

import { prisma } from "../../database/prisma.js";
import UrlService from "../../services/UrlService.js";
import {
  FakeUrl,
  FakeUrlCollision,
  FakeUrlExpired,
  FakeUrlIncrement,
} from "../factories/UrlFactory.js";

const prismaMock = prisma.url as jest.Mocked<typeof prisma.url>;

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
  test("Should create a new url if collision is detected", async () => {
    prismaMock.findUnique.mockResolvedValueOnce(FakeUrl);
    prismaMock.findUnique.mockResolvedValueOnce(null);
    prismaMock.create.mockResolvedValue(FakeUrlCollision);
    const result = await service.createShortUrl(FakeUrlCollision);
    expect(result).not.toBe(FakeUrl);
  });
  test("Should delete url", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUrl);
    prismaMock.delete.mockResolvedValue(FakeUrl);
    const result = await service.deleteShortUrl({ userId: 1, urlId: 1 });
    expect(result).toBe(FakeUrl);
  });
  test("Should fail to delete url if userID different", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUrl);
    prismaMock.delete.mockResolvedValue(FakeUrl);
    const result = service.deleteShortUrl({ userId: 2, urlId: 1 });
    await expect(result).rejects.toThrow("URL not found or Unauthorized");
  });
  test("Should fail to delete if url dont exist", async () => {
    prismaMock.findUnique.mockResolvedValue(null);
    prismaMock.delete.mockResolvedValue(FakeUrl);
    const result = service.deleteShortUrl({ userId: 1, urlId: 1 });
    await expect(result).rejects.toThrow("URL not found or Unauthorized");
  });
  test("Should get user URLS", async () => {
    prismaMock.findMany.mockResolvedValue([]);
    const result = await service.getUserUrls({ userId: 1 });
    expect(result).toEqual([]);
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
