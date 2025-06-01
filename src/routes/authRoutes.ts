import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController";

const routes = Router();

routes.post("/login", loginUser);
routes.post("/login", registerUser);

export default routes;
