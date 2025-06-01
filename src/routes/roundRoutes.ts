import { createRound, getRound } from "../controllers/roundController"; 
import { Router } from "express";  


const routes = Router();

routes.get("", getRound);
routes.post("", createRound);

export default routes;