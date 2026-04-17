import { describe, it, expect, jest, test } from "@jest/globals";

jest.mock("../../database/prisma.js");

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import bcrypt from "bcrypt";
import { prisma } from "../../database/prisma.js";
import AuthService from "../../services/AuthService.js";

const prismaMock = prisma.user as jest.Mocked<typeof prisma.user>;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe("--AuthService tests--", () => {
  let service = new AuthService();
  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });
  test("Should create new user", async () => {
    prismaMock.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue("passwordHash");
  });
});
