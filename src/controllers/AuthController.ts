import { CreateUserInput, LoginUserInput } from "../schemas/auth.schema.js";
import AuthService from "../services/AuthService.js";
import { NextFunction, Request, Response } from "express";

class AuthController {
  constructor(private service: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    const { username, email, password } = req.body as CreateUserInput;

    const user = await this.service.createUser({ username, email, password });
    return res.status(201).json(user);
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body as LoginUserInput;
    const user = await this.service.loginUser({ email, password });
    return res.status(200).json(user);
  }
}

export default new AuthController(new AuthService());
