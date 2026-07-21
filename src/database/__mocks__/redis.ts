import {jest} from "@jest/globals";

export const redis = {
  ping: jest.fn<() => Promise<string>>().mockResolvedValue("PONG"),
  set: jest.fn()}