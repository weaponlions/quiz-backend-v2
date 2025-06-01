import Joi from "joi";
import { correctAnswerEnum, userTypeEnum, difficultyEnum  } from "@prisma/client";
import { 
  User, 
  Subject, 
  Topic, 
  Exam, 
  ExamSubject, 
  Test, 
  Question, 
  QuestionTranslation, 
  TestQuestion, 
  TestAttempt, 
  AttemptAnswer, 
  UserQuestionLog, 
  QuestionPool,
  // difficultyEnum
} from "../types";

export const userSchema = Joi.object<User>({
  username: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, ''),
  preferredLanguage: Joi.string().allow(null, ''),
  board: Joi.string().allow(null, ''),
  userType: Joi.string().valid(...Object.values(userTypeEnum)).default('STUDENT'),
  isActive: Joi.boolean().default(true)
});

export const updateUserRoleSchema = Joi.object({
  userType: Joi.string().valid(...Object.values(userTypeEnum)).required(),
});  

export const subjectSchema = Joi.object<Subject>({ 
  name: Joi.string().required(),
});

export const topicSchema = Joi.object<Topic>({ 
  subjectId: Joi.number().required(),
  name: Joi.string().required(),
});

export const examSchema = Joi.object<Exam>({
  name: Joi.string().required(),
  board: Joi.string().allow(null, ''),
  level: Joi.string().allow(null, ''),
  isActive: Joi.boolean().default(true)
});

export const examSubjectSchema = Joi.object<ExamSubject>({
  examId: Joi.number().required(),
  subjectId: Joi.number().required()
});

export const testSchema = Joi.object<Test>({
  name: Joi.string().required(),
  examId: Joi.number().allow(null),
  subjectId: Joi.number().allow(null),
  topicId: Joi.number().allow(null),
  durationMinutes: Joi.number().required(),
  isLive: Joi.boolean().default(false)
});

export const questionSchema = Joi.object<Question>({
  examId: Joi.number().allow(null),
  subjectId: Joi.number().required(),
  topicId: Joi.number().required(),
  difficulty: Joi.string().valid(...Object.values(difficultyEnum)).required()
});

export const questionTranslationSchema = Joi.object<QuestionTranslation>({
  questionId: Joi.number().required(),
  language: Joi.string().required(),
  questionText: Joi.string().required(),
  optionA: Joi.string().required(),
  optionB: Joi.string().required(),
  optionC: Joi.string().required(),
  optionD: Joi.string().required(),
  correctOption: Joi.string().valid(...Object.values(correctAnswerEnum)).required(),
  explanation: Joi.string().allow(null, '')
});

export const testQuestionSchema = Joi.object<TestQuestion>({
  testId: Joi.number().required(),
  questionId: Joi.number().required(),
  position: Joi.number().required()
});

export const testAttemptSchema = Joi.object<TestAttempt>({
  testId: Joi.number().required(),
  userId: Joi.number().required(),
  startedAt: Joi.date().default(new Date()),
  submittedAt: Joi.date().allow(null),
  score: Joi.number().allow(null)
});

export const updateTestAttemptSchema = Joi.object({
  submittedAt: Joi.date(),
  score: Joi.number()
});

export const attemptAnswerSchema = Joi.object<AttemptAnswer>({
  attemptId: Joi.number().required(),
  questionId: Joi.number().required(),
  selectedOption: Joi.string().valid(...Object.values(correctAnswerEnum)).allow(null),
  isCorrect: Joi.boolean().allow(null)
});

export const userQuestionLogSchema = Joi.object<UserQuestionLog>({
  userId: Joi.number().required(),
  questionId: Joi.number().required(),
  seenAt: Joi.date().default(new Date())
});

export const questionPoolSchema = Joi.object<QuestionPool>({
  questionId: Joi.number().required(),
  examId: Joi.number().allow(null),
  subjectId: Joi.number().allow(null),
  topicId: Joi.number().allow(null),
  difficulty: Joi.string().valid(...Object.values(difficultyEnum)).allow(null)
});
  