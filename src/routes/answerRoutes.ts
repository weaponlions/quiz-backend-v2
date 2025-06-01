import { createAnsweredQuestion, getAnsweredQuestion, updateAnsweredQuestion } from "../controllers/answeredController";
import { Router } from "express";

const router: Router = Router();

router.post("", createAnsweredQuestion);
router.get("", getAnsweredQuestion);
router.get("", updateAnsweredQuestion);

export default router;