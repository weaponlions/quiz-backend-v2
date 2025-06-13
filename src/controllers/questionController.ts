import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Question, StatusCode } from "../types";
import { questionModelSchema, questionSchema } from "../validators/schemaValidator";
import { isObjectEmpty, jsonResponse } from "../helpers";
import Joi from "joi";
import { createQuestionTranslation } from "../services/translationService";

// Create a single instance of PrismaClient to reuse
const prisma = new PrismaClient();

export const createQuestion = async (req: Request, res: Response) => {
    try {
        const joiResult = questionModelSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { examId, subjectId, topicId, difficulty, translations } = joiResult.value;

        // Check subject exists
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

        // Check topic exists and belongs to subject
        const topic = await prisma.topic.findUnique({ 
            where: { id: topicId, subjectId }
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

        // Check exam exists (optional)
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

        // Create question
        const newQuestion = await prisma.question.create({
            data: {
                examId,
                subjectId,
                topicId,
                difficulty
            }
        });

        // Inject questionId into each translation
        const translationInput = translations?.map(t => ({
            ...t,
            questionId: newQuestion.id
        })) || [];

        // Call service
        const translationResult = await createQuestionTranslation(translationInput);

        
        if (translationResult.status === StatusCode.BAD_REQUEST) {
            // Rollback question creation if all translations failed
            await prisma.question.delete({ where: { id: newQuestion.id } });

            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({
                    code: StatusCode.BAD_REQUEST,
                    data: [],
                    message: "All translations failed, question creation rolled back",
                })
            );
        }

        // Return full context to the client
        return res.status(translationResult.status).json(
            jsonResponse<any>({
                code: translationResult.status,
                data: {
                    question: newQuestion,
                    translations: translationResult.results
                },
                message: translationResult.message
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


export const importQuestions = async (req: Request, res: Response) => {
    try {
        const questionList = req.body;

        if (!Array.isArray(questionList) || questionList.length === 0) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Body must be a non-empty array of questions"
                })
            );
        }

        const results = [];

        for (const item of questionList) {
            const validation = questionModelSchema.validate(item, { abortEarly: false });

            if (validation.error) {
                results.push({
                    input: item,
                    success: false,
                    message: validation.error.details,
                });
                continue;
            }

            const { examId, subjectId, topicId, difficulty, translations } = validation.value;

            // Validate subject
            const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
            if (!subject) {
                results.push({
                    input: item,
                    success: false,
                    message: "Subject not found",
                });
                continue;
            }

            // Validate topic
            const topic = await prisma.topic.findUnique({
                where: {
                    id: topicId,
                    subjectId: subjectId,
                }
            });

            if (!topic) {
                results.push({
                    input: item,
                    success: false,
                    message: "Topic not found or doesn't belong to the subject",
                });
                continue;
            }

            // Validate exam (optional)
            if (examId) {
                const exam = await prisma.exam.findUnique({ where: { id: examId } });
                if (!exam) {
                    results.push({
                        input: item,
                        success: false,
                        message: "Exam not found",
                    });
                    continue;
                }
            }

            // Create Question
            const newQuestion = await prisma.question.create({
                data: {
                    examId,
                    subjectId,
                    topicId,
                    difficulty,
                }
            });

            // Add questionId to each translation
            const translationPayload = translations?.map(t => ({
                ...t,
                questionId: newQuestion.id,
            })) ?? [];

            const translationResult = await createQuestionTranslation(translationPayload);

            results.push({
                input: item,
                success: translationResult.success,
                message: translationResult.message,
                questionId: newQuestion.id,
                translationResults: translationResult.results,
            });
        }

        return res.status(StatusCode.OK).json(
            jsonResponse({
                code: StatusCode.OK,
                data: results,
                message: "Import process completed"
            })
        );

    } catch (error) {
        console.error("Error in importQuestions:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse({
                code: StatusCode.INTERNAL_SERVER_ERROR,
                data: [],
                message: "Unexpected error occurred"
            })
        );
    }
};
