import { createAttemptedTest, getAttemptedTest, updateAttemptedTest } from "../controllers/attemptedController";
import { Router } from "express";

const router: Router = Router();

router.post("", createAttemptedTest);
router.get("", getAttemptedTest);
router.put("", updateAttemptedTest);

export default router;