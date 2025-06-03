import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { QuestionTranslation, StatusCode } from "../types";
import { questionTranslationSchema } from "../validators/schemaValidator";
import { jsonResponse } from "../helpers";
import Joi from "joi";

export const createQuestionTranslation = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();

        const joiResult = questionTranslationSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { questionId, language, questionText, optionA, optionB, optionC, optionD, correctOption, explanation } = joiResult.value;

        // Verify question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Question not found" 
                })
            );
        }

        // Check if translation for this language already exists
        const existingTranslation = await prisma.questionTranslation.findUnique({
            where: {
                questionId_language: {
                    questionId,
                    language
                }
            }
        });

        if (existingTranslation) {
            return res.status(StatusCode.CONFLICT).json(
                jsonResponse<[]>({ 
                    code: StatusCode.CONFLICT, 
                    data: [], 
                    message: `A translation for language '${language}' already exists for this question` 
                })
            );
        }

        const newTranslation = await prisma.questionTranslation.create({
            data: {
                questionId,
                language,
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                explanation
            }
        });

        return res.status(StatusCode.CREATED).json(
            jsonResponse<QuestionTranslation[]>({ 
                code: StatusCode.CREATED, 
                data: [newTranslation], 
                message: "Question translation created successfully" 
            })
        );
    } catch (error) {
        console.error("Error creating question translation:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getQuestionTranslations = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        const { questionId, language } = req.query;
        
        let whereClause: any = {};

        // Build the where clause based on provided query parameters
        if (questionId) {
            const { error, value } = Joi.number().validate(questionId);
            if (!error) {
                whereClause.questionId = Number(value);
            }
        }

        if (language) {
            const { error, value } = Joi.string().validate(language);
            if (!error) {
                whereClause.language = value;
            }
        }

        const translations = await prisma.questionTranslation.findMany({
            where: whereClause,
            include: {
                question: true
            }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: translations, 
                message: "Question translations retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving question translations:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getQuestionTranslationById = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        const { id } = req.params;

        const translationId = parseInt(id);
        if (isNaN(translationId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid translation ID" 
                })
            );
        }

        const translation = await prisma.questionTranslation.findUnique({
            where: { id: translationId },
            include: {
                question: true
            }
        });

        if (!translation) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Translation not found" 
                })
            );
        }

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: [translation], 
                message: "Translation retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving translation:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const updateQuestionTranslation = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        const { id } = req.params;

        const translationId = parseInt(id);
        if (isNaN(translationId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid translation ID" 
                })
            );
        }

        // Check if translation exists
        const existingTranslation = await prisma.questionTranslation.findUnique({
            where: { id: translationId }
        });

        if (!existingTranslation) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Translation not found" 
                })
            );
        }

        const joiResult = questionTranslationSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { questionId, language, questionText, optionA, optionB, optionC, optionD, correctOption, explanation } = joiResult.value;

        // Verify question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Question not found" 
                })
            );
        }

        // If changing questionId or language, check if the combination already exists
        if (questionId !== existingTranslation.questionId || language !== existingTranslation.language) {
            const duplicateTranslation = await prisma.questionTranslation.findUnique({
                where: {
                    questionId_language: {
                        questionId,
                        language
                    }
                }
            });

            if (duplicateTranslation) {
                return res.status(StatusCode.CONFLICT).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.CONFLICT, 
                        data: [], 
                        message: `A translation for language '${language}' already exists for this question` 
                    })
                );
            }
        }

        const updatedTranslation = await prisma.questionTranslation.update({
            where: { id: translationId },
            data: {
                questionId,
                language,
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption,
                explanation
            }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<QuestionTranslation[]>({ 
                code: StatusCode.OK, 
                data: [updatedTranslation], 
                message: "Question translation updated successfully" 
            })
        );
    } catch (error) {
        console.error("Error updating question translation:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const deleteQuestionTranslation = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        const { id } = req.params;

        const translationId = parseInt(id);
        if (isNaN(translationId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid translation ID" 
                })
            );
        }

        // Check if translation exists
        const existingTranslation = await prisma.questionTranslation.findUnique({
            where: { id: translationId }
        });

        if (!existingTranslation) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Translation not found" 
                })
            );
        }

        // Delete the translation
        await prisma.questionTranslation.delete({
            where: { id: translationId }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<[]>({ 
                code: StatusCode.OK, 
                data: [], 
                message: "Question translation deleted successfully" 
            })
        );
    } catch (error) {
        console.error("Error deleting question translation:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
}; 