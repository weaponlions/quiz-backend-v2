import { PrismaClient } from "@prisma/client"; 
import { QuestionTranslation, StatusCode } from "../types";
import { questionTranslationSchema } from "../validators/schemaValidator"; 
import Joi from "joi";

const prisma = new PrismaClient();

export const createQuestionTranslation = async (body: any[]) => {
    if (!Array.isArray(body) || body.length === 0) {
        return {
            success: false,
            status: StatusCode.BAD_REQUEST,
            results: [],
            message: "Request body must be a non-empty array"
        };
    }

    const results = [];

    for (const item of body) {
        const joiResult = questionTranslationSchema.validate(item, { abortEarly: false });

        if (joiResult.error) {
            results.push({
                input: item,
                success: false,
                message: joiResult.error.details
            });
            continue;
        }

        const { questionId, language, questionText, optionA, optionB, optionC, optionD, correctOption, explanation } = joiResult.value;

        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question) {
            results.push({
                input: item,
                success: false,
                message: `Question with ID ${questionId} not found`
            });
            continue;
        }

        const existingTranslation = await prisma.questionTranslation.findUnique({
            where: {
                questionId_language: {
                    questionId,
                    language
                }
            }
        });

        if (existingTranslation) {
            results.push({
                input: item,
                success: false,
                message: `Translation for language '${language}' already exists for question ID ${questionId}`
            });
            continue;
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

        results.push({
            input: {},
            success: true,
            data: newTranslation,
            message: "Translation created successfully"
        });
    }

    const allSuccess = results.every(r => r.success);
    const anySuccess = results.some(r => r.success);

    return {
        success: anySuccess,
        status: allSuccess
            ? StatusCode.CREATED
            : anySuccess
                ? StatusCode.PARTIAL_CONTENT
                : StatusCode.BAD_REQUEST,
        results,
        message: allSuccess
            ? "All translations created successfully"
            : anySuccess
                ? "Some translations created successfully"
                : "No translations were created"
    };
};


export const getQuestionTranslations = async (query: any) => {
    let whereClause: any = {};

    if (query.questionId) {
        const { error, value } = Joi.number().validate(query.questionId);
        if (!error) whereClause.questionId = Number(value);
    }

    if (query.language) {
        const { error, value } = Joi.string().validate(query.language);
        if (!error) whereClause.language = value;
    }

    const translations = await prisma.questionTranslation.findMany({
        where: whereClause,
        include: { question: true }
    });

    return {
        status: StatusCode.OK,
        data: translations,
        message: "Question translations retrieved successfully"
    };
};

export const getQuestionTranslationById = async (id: string) => {
    const translationId = parseInt(id);
    if (isNaN(translationId)) {
        return {
            status: StatusCode.BAD_REQUEST,
            data: [],
            message: "Invalid translation ID"
        };
    }

    const translation = await prisma.questionTranslation.findUnique({
        where: { id: translationId },
        include: { question: true }
    });

    if (!translation) {
        return {
            status: StatusCode.NOT_FOUND,
            data: [],
            message: "Translation not found"
        };
    }

    return {
        status: StatusCode.OK,
        data: [translation],
        message: "Translation retrieved successfully"
    };
};


export const updateQuestionTranslation = async (id: string, body: any) => {
    const translationId = parseInt(id);
    if (isNaN(translationId)) {
        return {
            status: StatusCode.BAD_REQUEST,
            data: [],
            message: "Invalid translation ID"
        };
    }

    const existingTranslation = await prisma.questionTranslation.findUnique({ where: { id: translationId } });
    if (!existingTranslation) {
        return {
            status: StatusCode.NOT_FOUND,
            data: [],
            message: "Translation not found"
        };
    }

    const joiResult = questionTranslationSchema.validate(body, { abortEarly: false });
    if (joiResult.error) {
        return {
            status: StatusCode.BAD_REQUEST,
            data: [],
            message: joiResult.error.details
        };
    }

    const { questionId, language } = joiResult.value;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
        return {
            status: StatusCode.BAD_REQUEST,
            data: [],
            message: "Question not found"
        };
    }

    if (questionId !== existingTranslation.questionId || language !== existingTranslation.language) {
        const duplicate = await prisma.questionTranslation.findUnique({
            where: {
                questionId_language: {
                    questionId,
                    language
                }
            }
        });
        if (duplicate) {
            return {
                status: StatusCode.CONFLICT,
                data: [],
                message: `A translation for language '${language}' already exists for this question`
            };
        }
    }

    const updatedTranslation = await prisma.questionTranslation.update({
        where: { id: translationId },
        data: joiResult.value
    });

    return {
        status: StatusCode.OK,
        data: [updatedTranslation],
        message: "Question translation updated successfully"
    };
};


export const deleteQuestionTranslation = async (id: string) => {
    const translationId = parseInt(id);
    if (isNaN(translationId)) {
        return {
            status: StatusCode.BAD_REQUEST,
            data: [],
            message: "Invalid translation ID"
        };
    }

    const existingTranslation = await prisma.questionTranslation.findUnique({ where: { id: translationId } });
    if (!existingTranslation) {
        return {
            status: StatusCode.NOT_FOUND,
            data: [],
            message: "Translation not found"
        };
    }

    await prisma.questionTranslation.delete({ where: { id: translationId } });

    return {
        status: StatusCode.OK,
        data: [],
        message: "Question translation deleted successfully"
    };
};
