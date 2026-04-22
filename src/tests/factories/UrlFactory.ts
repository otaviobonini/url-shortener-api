import { UrlModel } from "../../types/url.js";

export const FakeUrl: UrlModel = {
  id: 1,
  originalUrl: "https://example.com",
  hashedUrl: "12345678",
  counter: 0,
  createdAt: new Date(),
  expires: null,
  userId: 1,
};

export const FakeUrlIncrement: UrlModel = {
  id: 1,
  originalUrl: "https://example.com",
  hashedUrl: "abc123",
  counter: 1,
  createdAt: new Date(),
  expires: null,
  userId: 1,
};

export const FakeUrlCollision: UrlModel = {
  id: 1,
  originalUrl: "https://example.com",
  hashedUrl: "def123",
  counter: 0,
  createdAt: new Date(),
  expires: null,
  userId: 1,
};

export const FakeUrlExpired: UrlModel = {
  id: 1,
  originalUrl: "https://example.com",
  hashedUrl: "abc123",
  counter: 0,
  createdAt: new Date("2019-01-01"),
  expires: new Date("2020-01-01"),
  userId: 1,
};

export const FakeUrlList: UrlModel[] = [
  {
    id: 1,
    originalUrl: "https://example.com",
    hashedUrl: "abc123",
    counter: 0,
    createdAt: new Date(),
    expires: null,
    userId: 1,
  },
  {
    id: 2,
    originalUrl: "https://example2.com",
    hashedUrl: "def123",
    counter: 0,
    createdAt: new Date(),
    expires: null,
    userId: 1,
  },
  {
    id: 3,
    originalUrl: "https://example3.com",
    hashedUrl: "ghi123",
    counter: 0,
    createdAt: new Date(),
    expires: null,
    userId: 1,
  },
];
