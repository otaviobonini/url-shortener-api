import {jest} from "@jest/globals";

export const redis = {
  ping: jest.fn<() => Promise<string>>().mockResolvedValue("PONG"),
  set: jest.fn<() => Promise<string>>().mockResolvedValue("OK"),
  get: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
  del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
  call: jest.fn(),
};