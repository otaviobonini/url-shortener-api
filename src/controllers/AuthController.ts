import AuthService from "../service/AuthService.js";
import { Request, Response } from "express";
const service = new AuthService();

class AuthController {
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    try {
      const user = await service.createUser({ username, email, password });
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await service.loginUser({ email, password });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
}
export default new AuthController();
