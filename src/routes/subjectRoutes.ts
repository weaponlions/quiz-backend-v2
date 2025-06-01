import { createSubject, getSubject, getSubjectById, updateSubject } from "../controllers/subjectController"; 
import { Router } from "express"; 


const routes = Router();

routes.get("", getSubject);
routes.get("/:id", getSubjectById);
routes.post("", createSubject);
routes.put("/:subjectId", updateSubject);

export default routes;