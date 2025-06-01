import { Router } from "express";
import { 
    createTest, 
    getTests, 
    getTestById, 
    updateTest, 
    deleteTest 
} from "../controllers/testController";

const router = Router();

// GET /api/tests - Get all tests with optional filters
router.get("/", getTests);

// GET /api/tests/:id - Get test by ID
router.get("/:id", getTestById);

// POST /api/tests - Create a new test
router.post("/", createTest);

// PUT /api/tests/:id - Update a test
router.put("/:id", updateTest);

// DELETE /api/tests/:id - Delete a test
router.delete("/:id", deleteTest);

export default router; 