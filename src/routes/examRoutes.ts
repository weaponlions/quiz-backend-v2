import { Router } from "express";
import { createExam, getExam, updateExam } from "../controllers/examController";


const routes = Router();

routes.get("", getExam);
routes.post("", createExam);
routes.put("/:examId", updateExam);

export default routes;