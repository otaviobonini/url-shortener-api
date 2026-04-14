import { CreateUserInput, LoginUserInput } from "../schemas/auth.schema.js";
import AuthService from "../service/AuthService.js";
import { Request, Response } from "express";
const service = new AuthService();

class AuthController {
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body as CreateUserInput;
    try {
      const user = await service.createUser({ username, email, password });
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Unknown error" });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginUserInput;
    try {
      const user = await service.loginUser({ email, password });
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Unknown error" });
  }
}

export default new AuthController();
