import { getTopic, createTopic, editTopic} from "../controllers/topicController"; 
import { Router } from "express";  


const routes = Router();

routes.get("", getTopic);
routes.post("", createTopic);
routes.put("/:id",editTopic);
export default routes;