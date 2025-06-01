import { createBulkTopicQuestions, createTopicQuestion, deleteTopicQuestion, getTopicQuestion, updateTopicQuestion, updateTopicQuestionById } from "../controllers/topicQuestionController"
import { Router } from "express";  


const routes = Router();

routes.get("", getTopicQuestion);
routes.post("", createTopicQuestion);
routes.post('/bulk', createBulkTopicQuestions);
routes.put("/:id", updateTopicQuestionById);

export default routes;