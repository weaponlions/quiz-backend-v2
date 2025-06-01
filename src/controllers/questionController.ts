import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Question, StatusCode } from "../types";
import { questionSchema } from "../validators/schemaValidator";
import { isObjectEmpty, jsonResponse } from "../helpers";
import Joi from "joi";

// Create a single instance of PrismaClient to reuse
const prisma = new PrismaClient();

export const createQuestion = async (req: Request, res: Response) => {
    try {
        const joiResult = questionSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { examId, subjectId, topicId, difficulty } = joiResult.value;

        // Verify subject exists
        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Subject not found" 
                })
            );
        }

        // Verify topic exists and belongs to the subject
        const topic = await prisma.topic.findUnique({ 
            where: { 
                id: topicId,
                subjectId: subjectId
            } 
        });
        if (!topic) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Topic not found or doesn't belong to the specified subject" 
                })
            );
        }

        // Verify exam exists if provided
        if (examId) {
            const exam = await prisma.exam.findUnique({ where: { id: examId } });
            if (!exam) {
                return res.status(StatusCode.BAD_REQUEST).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.BAD_REQUEST, 
                        data: [], 
                        message: "Exam not found" 
                    })
                );
            }
        }

        const newQuestion = await prisma.question.create({
            data: {
                examId,
                subjectId,
                topicId,
                difficulty
            }
        });

        return res.status(StatusCode.CREATED).json(
            jsonResponse<Question[]>({ 
                code: StatusCode.CREATED, 
                data: [newQuestion], 
                message: "Question created successfully" 
            })
        );
    } catch (error) {
        console.error("Error creating question:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { examId, subjectId, topicId, difficulty } = req.query;
        
        let whereClause: any = {};

        // Build the where clause based on provided query parameters
        if (examId) {
            const { error, value } = Joi.number().validate(examId);
            if (!error) {
                whereClause.examId = Number(value);
            }
        }

        if (subjectId) {
            const { error, value } = Joi.number().validate(subjectId);
            if (!error) {
                whereClause.subjectId = Number(value);
            }
        }

        if (topicId) {
            const { error, value } = Joi.number().validate(topicId);
            if (!error) {
                whereClause.topicId = Number(value);
            }
        }

        if (difficulty) {
            const { error, value } = Joi.string().validate(difficulty);
            if (!error) {
                whereClause.difficulty = value;
            }
        }

        const questions = await prisma.question.findMany({
            where: whereClause,
            include: {
                translations: true,
                exam: true,
                subject: true,
                topic: true
            }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: questions, 
                message: "Questions retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving questions:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getQuestionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const questionId = Number(id);
        if (isNaN(questionId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid question ID" 
                })
            );
        }

        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                translations: true,
                exam: true,
                subject: true,
                topic: true
            }
        });

        if (!question) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Question not found" 
                })
            );
        }

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: [question], 
                message: "Question retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving question:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const questionId = Number(id);
        if (isNaN(questionId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid question ID" 
                })
            );
        }

        // Check if question exists
        const existingQuestion = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!existingQuestion) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Question not found" 
                })
            );
        }

        const joiResult = questionSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { examId, subjectId, topicId, difficulty } = joiResult.value;

        // Verify subject exists
        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subject) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Subject not found" 
                })
            );
        }

        // Verify topic exists and belongs to the subject
        const topic = await prisma.topic.findUnique({ 
            where: { 
                id: topicId,
                subjectId: subjectId
            } 
        });
        if (!topic) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Topic not found or doesn't belong to the specified subject" 
                })
            );
        }

        // Verify exam exists if provided
        if (examId) {
            const exam = await prisma.exam.findUnique({ where: { id: examId } });
            if (!exam) {
                return res.status(StatusCode.BAD_REQUEST).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.BAD_REQUEST, 
                        data: [], 
                        message: "Exam not found" 
                    })
                );
            }
        }

        const updatedQuestion = await prisma.question.update({
            where: { id: questionId },
            data: {
                examId,
                subjectId,
                topicId,
                difficulty
            }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<Question[]>({ 
                code: StatusCode.OK, 
                data: [updatedQuestion], 
                message: "Question updated successfully" 
            })
        );
    } catch (error) {
        console.error("Error updating question:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const questionId = Number(id);
        if (isNaN(questionId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid question ID" 
                })
            );
        }

        // Check if question exists
        const existingQuestion = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!existingQuestion) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Question not found" 
                })
            );
        }

        // Delete the question
        await prisma.question.delete({
            where: { id: questionId }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<[]>({ 
                code: StatusCode.OK, 
                data: [], 
                message: "Question deleted successfully" 
            })
        );
    } catch (error) {
        console.error("Error deleting question:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
}; 