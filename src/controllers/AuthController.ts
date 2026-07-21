import { CreateUserInput, LoginUserInput } from "../schemas/auth.schema.js";
import AuthService from "../services/AuthService.js";
import { AppError } from "../common/AppError.js";
import { Request, Response, CookieOptions } from "express";
import { env } from "../schemas/env.schema.js";


const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days, matches the token TTL

// httpOnly keeps the refresh token out of JS; path scopes it to the auth routes.
// In production (HTTPS) we use secure + sameSite=none so a cross-origin SPA can
// send it; in dev we fall back to lax so it works over http://localhost.
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

class AuthController {
  constructor(private service: AuthService) {}

  async register(req: Request, res: Response) {
    const { username, email, password } = req.body as CreateUserInput;

    const user = await this.service.createUser({ username, email, password });
    return res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginUserInput;
    const { refreshToken, ...user } = await this.service.loginUser({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      ...baseCookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });
    return res.status(200).json(user);
  }

  async refresh(req: Request, res: Response) {
    const oldRefreshToken = req.cookies?.["refreshToken"];
    if (!oldRefreshToken) {
      throw new AppError(401, "Refresh token missing");
    }

    const { token, refreshToken } =
      await this.service.renewRefreshToken(oldRefreshToken);

    res.cookie("refreshToken", refreshToken, {
      ...baseCookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });
    return res.status(200).json({ token });
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.["refreshToken"];
    if (refreshToken) {
      await this.service.logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken", baseCookieOptions);
    return res.status(204).send();
  }
}

export default new AuthController(new AuthService());
