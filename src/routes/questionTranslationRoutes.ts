import { Router } from "express";
import { 
    createQuestionTranslation, 
    getQuestionTranslations, 
    getQuestionTranslationById, 
    updateQuestionTranslation, 
    deleteQuestionTranslation 
} from "../controllers/questionTranslationController";

const router = Router();

// GET /api/question-translations - Get all translations with optional filters
router.get("/", getQuestionTranslations);

// GET /api/question-translations/:id - Get translation by ID
router.get("/:id", getQuestionTranslationById);

// POST /api/question-translations - Create a new translation
router.post("/", createQuestionTranslation);

// PUT /api/question-translations/:id - Update a translation
router.put("/:id", updateQuestionTranslation);

// DELETE /api/question-translations/:id - Delete a translation
router.delete("/:id", deleteQuestionTranslation);

export default router; 