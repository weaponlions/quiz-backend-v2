import { createSubject, getSubject, updateSubject } from "../controllers/subjectController"; 
import { Router } from "express"; 


const routes = Router();

routes.get("", getSubject);
routes.post("", createSubject);
routes.put("/:subjectId", updateSubject);

export default routes;