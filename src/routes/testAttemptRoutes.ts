import { createAttemptedTest, getAttemptedTest, updateAttemptedTest } from "./../controllers/testAttemptedController";
import { Router } from "express";

const router = Router();

router.get("/", getAttemptedTest);

router.post("/", createAttemptedTest);

router.put("/:id", updateAttemptedTest);


export default router; 