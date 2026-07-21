import { AppError } from "../common/AppError.js";
import { prisma } from "../database/prisma.js";
import { CreateUser, LoginUser } from "../types/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../schemas/env.schema.js";
import crypto from "node:crypto";


export default class AuthService {
  async createUser({ username, password, email }: CreateUser) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new AppError(409, "Email already in use");
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
      throw new AppError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = await this.generateRefreshToken(user.id);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      token,
      refreshToken,
    };
  }
  async generateRefreshToken(userId: number): Promise<string> {
    const rawRefreshToken = crypto.randomUUID();
    const hashedRefreshToken = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Now we can store the hashed refresh token in the database, since we have hashed it
    await prisma.refreshToken.create({
      data: {
        userId,
        hashedToken: hashedRefreshToken,
        expiresAt: expiresAt,
      }
    })
    return rawRefreshToken; // Return the raw token to the client
  }
  async renewRefreshToken(oldRefreshToken: string): Promise<{ token: string, refreshToken: string }> {
    const hashedOldRefreshToken = crypto.createHash("sha256").update(oldRefreshToken).digest("hex");
    const storedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken: hashedOldRefreshToken },
    });
    if (!storedToken) {
      throw new AppError(401, "Invalid refresh token");
    }
    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
    });
    if (!user) {
      throw new AppError(401, "User not found");
    }
    if (storedToken.expiresAt < new Date()) {
      throw new AppError(401, "Refresh token expired");
    }
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId);
    // Delete the old refresh token from the database
    await prisma.refreshToken.delete({
      where: { hashedToken: hashedOldRefreshToken },
    });
    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: "15m",
    });



    return { token, refreshToken: newRefreshToken };
  }
  async logoutUser(refreshToken: string): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
   await prisma.refreshToken.deleteMany({
  where: {
    hashedToken,
  },
});
  }
 async purgeExpiredRefreshTokens(): Promise<number> {
  const { count } = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
}
}
