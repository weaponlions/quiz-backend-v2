import { correctAnswerEnum, userTypeEnum, difficultyEnum } from "@prisma/client";

// export enum difficultyEnum {
//   EASY = "EASY",
//   MEDIUM = "MEDIUM",
//   HARD = "HARD"
// }

export enum ExamBoardTypeEnum {
    SPECIAL = "SPECIAL",
    STATE = "STATE",
    CENTRAL = "CENTRAL",
}

export type ExamBoard = {
    examBoardType: 'CENTRAL' | 'SPECIAL' | 'STATE';
    examBoardLongName: string;
    examBoardShortName: string;
    examName: string;
    boardLogo: string;
    examLogo: string;
    active: boolean;
};

export type User = {
  id?: number;
  username: string;
  password: string;
  email: string;
  phone?: string | null;
  preferredLanguage?: string | null;
  board?: string | null;
  userType: userTypeEnum;
  isActive?: boolean;
};

export type Subject = {
  id?: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Topic = {
  id?: number;
  subjectId: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Exam = {
  id?: number;
  name: string;
  board?: string | null;
  level?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ExamSubject = {
  id?: number;
  examId: number;
  subjectId: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Test = {
  id?: number;
  name: string;
  examId?: number | null;
  subjectId?: number | null;
  topicId?: number | null;
  durationMinutes: number;
  isLive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Question = {
  id?: number;
  examId?: number | null;
  subjectId: number;
  topicId: number;
  difficulty: difficultyEnum;
  createdAt?: Date;
  updatedAt?: Date;
};

export type QuestionTranslation = {
  id?: number;
  questionId: number;
  language: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: correctAnswerEnum;
  explanation?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TestQuestion = {
  id?: number;
  testId: number;
  questionId: number;
  position: number;
};

export type TestAttempt = {
  id?: number;
  testId: number;
  userId: number;
  startedAt?: Date;
  submittedAt?: Date;
  score?: number;
};

export type AttemptAnswer = {
  id?: number;
  attemptId: number;
  questionId: number;
  selectedOption?: correctAnswerEnum;
  isCorrect?: boolean;
};

export type UserQuestionLog = {
  id?: number;
  userId: number;
  questionId: number;
  seenAt?: Date;
};

export type QuestionPool = {
  id?: number;
  questionId: number;
  examId?: number;
  subjectId?: number;
  topicId?: number;
  difficulty?: difficultyEnum;
  createdAt?: Date;
  updatedAt?: Date;
};

export enum StatusCode {
    // Informational Responses (100–199)
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,

    // Success Responses (200–299)
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,

    // Client Error Responses (400–499)
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401, 
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406, 
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    PAYLOAD_TOO_LARGE = 413,
    UNSUPPORTED_MEDIA_TYPE = 415, 
    LOCKED = 423,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,

    // Server Error Responses (500–599)
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    NETWORK_AUTHENTICATION_REQUIRED = 511
}

