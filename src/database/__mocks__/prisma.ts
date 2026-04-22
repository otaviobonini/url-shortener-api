import { jest } from "@jest/globals";

export const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  url: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};
