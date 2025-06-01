import { Router } from "express";
import { 
    createQuestion, 
    getQuestions, 
    getQuestionById, 
    updateQuestion, 
    deleteQuestion 
} from "../controllers/questionController";

const router = Router();

// GET /api/questions - Get all questions with optional filters
router.get("/", getQuestions);

// GET /api/questions/:id - Get question by ID
router.get("/:id", getQuestionById);

// POST /api/questions - Create a new question
router.post("/", createQuestion);

// PUT /api/questions/:id - Update a question
router.put("/:id", updateQuestion);

// DELETE /api/questions/:id - Delete a question
router.delete("/:id", deleteQuestion);

export default router; 