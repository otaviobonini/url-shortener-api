import { prisma } from "../database/prisma.js";
import { CreateUser, LoginUser } from "../types/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class AuthService {
  async createUser({ username, password, email }: CreateUser) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        hashedPassword,
        email,
      },
    });
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
  async loginUser({ email, password }: LoginUser) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        hashedPassword: true,
      },
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("Undefined JWT_SECRET");
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      token,
    };
  }
}
