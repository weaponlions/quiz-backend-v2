import { Router } from "express"
import examRoutes from "./examRoutes";
import subjectRoutes from "./subjectRoutes";
import topicRoutes from "./topicRoutes";
import questionRoutes from "./questionRoutes";
import userRoutes from "./userRoutes"; 
import questionTranslationRoutes from "./questionTranslationRoutes";
import testRoutes from "./testRoutes";
import testQuestionRoutes from "./testQuestionRoutes";
import testAttemptRoutes from "./testAttemptRoutes";

const router = Router();

// Legacy routes
router.use("/exam", examRoutes);
router.use("/subject", subjectRoutes);
router.use("/topic", topicRoutes);
// router.use("/question", questionRoutes);
router.use("/user", userRoutes);

// New routes
router.use("/question", questionRoutes);
router.use("/question-translation", questionTranslationRoutes);
router.use("/test", testRoutes);
router.use("/test-question", testQuestionRoutes);
router.use("/test-attempt", testAttemptRoutes);

export default router;