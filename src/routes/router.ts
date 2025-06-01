import { Router } from "express"
import examRoutes from "./examRoutes";
import subjectRoutes from "./subjectRoutes";
import topicRoutes from "./topicRoutes";
import roundRoutes from "./roundRoutes";
import questionRoutes from "./questionRoutes";
import userRoutes from "./userRoutes";
import newQuestionRoutes from "./newQuestionRoutes";
import questionTranslationRoutes from "./questionTranslationRoutes";
import testRoutes from "./testRoutes";
import testQuestionRoutes from "./testQuestionRoutes";
import testAttemptRoutes from "./testAttemptRoutes";

const router = Router();

// Legacy routes
router.use("/exam", examRoutes);
router.use("/subject", subjectRoutes);
router.use("/topic", topicRoutes);
router.use("/round", roundRoutes);
router.use("/question", questionRoutes);
router.use("/user", userRoutes);

// New routes
router.use("/api/questions", newQuestionRoutes);
router.use("/api/question-translations", questionTranslationRoutes);
router.use("/api/tests", testRoutes);
router.use("/api/test-questions", testQuestionRoutes);
router.use("/api/test-attempts", testAttemptRoutes);

export default router;