import { describe, it, expect, jest, test } from "@jest/globals";

jest.mock("../../database/prisma.js");

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../database/prisma.js";
import AuthService from "../../services/AuthService.js";
import {
  FakeUser,
  FakeUserInfo,
  LoginUserInput,
} from "../factories/UserFactory.js";

const jwtMock = jwt as jest.Mocked<typeof jwt>;
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
    prismaMock.create.mockResolvedValue(FakeUserInfo);
    bcryptMock.hash.mockResolvedValue("hashedpassword" as never);

    const result = await service.createUser(FakeUser);
    expect(result).toEqual({
      id: FakeUserInfo.id,
      email: FakeUserInfo.email,
      username: FakeUserInfo.username,
    });
  });
  test("Should fail if email already exists", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUserInfo);
    const result = service.createUser(FakeUser);
    await expect(result).rejects.toThrow("Email already in use");
  });
  test("Should login sucessfully", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUserInfo);
    bcryptMock.compare.mockResolvedValue(true as never);
    jwtMock.sign.mockReturnValue("token" as never);
    const result = await service.loginUser(LoginUserInput);
    expect(result).toEqual({
      id: FakeUserInfo.id,
      email: FakeUserInfo.email,
      username: FakeUserInfo.username,
      token: "token",
    });
  });
  test("Should fail login if password incorrect", async () => {
    prismaMock.findUnique.mockResolvedValue(FakeUserInfo);
    bcryptMock.compare.mockResolvedValue(false as never);
    const result = service.loginUser(LoginUserInput);
    await expect(result).rejects.toThrow("Invalid email or password");
  });
  test("Should fail if password doesnt exists", async () => {
    prismaMock.findUnique.mockResolvedValue(null);
    const result = service.loginUser(LoginUserInput);
    await expect(result).rejects.toThrow("Invalid email or password");
  });
});
