import { CreateUser } from "../../types/user.js";

export const FakeUser: CreateUser = {
  username: "teste",
  email: "teste@gmail.com",
  password: "123",
};

export const FakeUserInfo = {
  email: "teste@gmail.com",
  username: "teste",
  hashedPassword: "hashedpassword",
  id: 1,
};

export const LoginUserInput = {
  email: "teste@gmail.com",
  password: "123",
};
