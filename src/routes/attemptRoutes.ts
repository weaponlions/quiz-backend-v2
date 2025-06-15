import { createAttemptedTest, getAttemptedTest, updateAttemptedTest } from "../controllers/testAttemptedController";
import { Router } from "express";

const router: Router = Router();

router.post("", createAttemptedTest);
router.get("", getAttemptedTest);
router.put("", updateAttemptedTest);

export default router;