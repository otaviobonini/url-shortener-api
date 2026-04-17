import { describe, test, expect, jest, beforeEach } from "@jest/globals";

/* ---------------- MOCKS ---------------- */

jest.mock("../database/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mockedtoken"),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

/* ---------------- IMPORTS ---------------- */

import { prisma } from "../database/prisma.js";
import AuthService from "../service/AuthService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const MockedPrisma = prisma.user as jest.Mocked<typeof prisma.user>;

/* ---------------- TESTS ---------------- */

describe("AuthService", () => {
  const service = new AuthService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should create a user successfully", async () => {
    MockedPrisma.findUnique.mockResolvedValue(null);

    MockedPrisma.create.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      hashedPassword: "hashedpassword",
    });

    const result = await service.createUser({
      username: "testuser",
      email: "test@example.com",
      password: "password",
    });

    expect(result).toEqual({
      id: 1,
      username: "testuser",
      email: "test@example.com",
    });
  });

  test("Should throw if email is already in use", async () => {
    MockedPrisma.findUnique.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      hashedPassword: "hashedpassword",
    });

    await expect(
      service.createUser({
        username: "testuser",
        email: "test@example.com",
        password: "password",
      }),
    ).rejects.toThrow("Email already in use");
  });

  test("Should login successfully", async () => {
    MockedPrisma.findUnique.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      hashedPassword: "hashedpassword",
    });

    (bcrypt.compare as any).mockResolvedValue(true);

    const result = await service.loginUser({
      email: "test@example.com",
      password: "password",
    });

    expect(result).toEqual({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      token: "mockedtoken",
    });
  });

  test("Should throw if email not found", async () => {
    MockedPrisma.findUnique.mockResolvedValue(null);

    await expect(
      service.loginUser({
        email: "test@example.com",
        password: "password",
      }),
    ).rejects.toThrow("Invalid email or password");
  });

  test("Should throw if password is wrong", async () => {
    MockedPrisma.findUnique.mockResolvedValue({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      hashedPassword: "hashedpassword",
    });

    (bcrypt.compare as any).mockResolvedValue(false);

    await expect(
      service.loginUser({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    ).rejects.toThrow("Invalid email or password");
  });
});
