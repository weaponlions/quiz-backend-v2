import { Router } from "express";
import { addExamSubject, createExam, deleteExamSubject, getExam, getExamSubject, updateExam, updateExamSubject } from "../controllers/examController";


const routes = Router();

routes.get("", getExam);
routes.post("", createExam);
routes.put("/:examId", updateExam);
routes.post("/subject", addExamSubject);
routes.get("/subject", getExamSubject);
routes.put("/subject", updateExamSubject);
routes.delete("/subject", deleteExamSubject);

export default routes;