import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Test, StatusCode } from "../types";
import { testSchema } from "../validators/schemaValidator";
import { jsonResponse } from "../helpers";
import Joi from "joi";

const prisma = new PrismaClient();

export const createTest = async (req: Request, res: Response) => {
    try {
        const joiResult = testSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { name, examId, subjectId, topicId, durationMinutes, isLive } = joiResult.value;

        // Verify references exist if provided
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

        if (subjectId) {
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
        }

        if (topicId) {
            const topic = await prisma.topic.findUnique({ 
                where: { id: topicId } 
            });
            if (!topic) {
                return res.status(StatusCode.BAD_REQUEST).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.BAD_REQUEST, 
                        data: [], 
                        message: "Topic not found" 
                    })
                );
            }

            // Ensure topic belongs to the subject if both are provided
            if (subjectId && topic.subjectId !== subjectId) {
                return res.status(StatusCode.BAD_REQUEST).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.BAD_REQUEST, 
                        data: [], 
                        message: "Topic does not belong to the specified subject" 
                    })
                );
            }
        }

        const newTest = await prisma.test.create({
            data: {
                name,
                examId,
                subjectId,
                topicId,
                durationMinutes,
                isLive
            }
        });

        return res.status(StatusCode.CREATED).json(
            jsonResponse<Test[]>({ 
                code: StatusCode.CREATED, 
                data: [newTest], 
                message: "Test created successfully" 
            })
        );
    } catch (error) {
        console.error("Error creating test:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getTests = async (req: Request, res: Response) => {
    try {
        const { testId, examId, subjectId, topicId, isLive, withQuestion } = req.query;
        
        let whereClause: any = {};
        let withTestQuestion: boolean = true;

        // Build the where clause based on provided query parameters
        if (testId) {
            const { error, value } = Joi.number().validate(testId);
            if (!error) {
                whereClause.id = Number(value);
            }
        }
                
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

        if (isLive !== undefined) {
            const { error, value } = Joi.boolean().truthy("true").falsy("false").validate(isLive === 'true');
            if (!error) {
                whereClause.isLive = value;
            }
        } 

        if (withQuestion !== undefined) {
            const { error, value } = Joi.boolean().truthy("true").falsy("false").validate(withQuestion === 'true');
            if (!error) {
                withTestQuestion = value;
            }
        } 

        const tests = await prisma.test.findMany({
            where: whereClause,
            include: {
                exam: true,
                subject: true,
                topic: true,
                testQuestions: withTestQuestion === true ? {
                    include: {
                        question: {
                            include: {
                                translations: {
                                    where: {
                                        language: 'en'
                                    }
                                }
                            }
                        }
                    }
                } : false,
                _count: {
                    select: {
                        testQuestions: true,
                        testAttempts: true
                    }
                }
            }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: tests, 
                message: "Tests retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving tests:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getTestById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const testId = parseInt(id);
        if (isNaN(testId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid test ID" 
                })
            );
        }

        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                exam: true,
                subject: true,
                topic: true,
                testQuestions: {
                    include: {
                        question: {
                            include: {
                                translations: true
                            }
                        }
                    },
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        });

        if (!test) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Test not found" 
                })
            );
        }

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: [test], 
                message: "Test retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving test:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const updateTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const testId = parseInt(id);
        if (isNaN(testId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid test ID" 
                })
            );
        }

        // Check if test exists
        const existingTest = await prisma.test.findUnique({
            where: { id: testId }
        });

        if (!existingTest) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Test not found" 
                })
            );
        }

        const joiResult = testSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { name, examId, subjectId, topicId, durationMinutes, isLive } = joiResult.value;

        // Verify references exist if provided
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

        if (subjectId) {
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
        }

        if (topicId) {
            const topic = await prisma.topic.findUnique({ 
                where: { id: topicId } 
            });
            if (!topic) {
                return res.status(StatusCode.BAD_REQUEST).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.BAD_REQUEST, 
                        data: [], 
                        message: "Topic not found" 
                    })
                );
            }

            // Ensure topic belongs to the subject if both are provided
            if (subjectId && topic.subjectId !== subjectId) {
                return res.status(StatusCode.BAD_REQUEST).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.BAD_REQUEST, 
                        data: [], 
                        message: "Topic does not belong to the specified subject" 
                    })
                );
            }
        }

        const updatedTest = await prisma.test.update({
            where: { id: testId },
            data: {
                name,
                examId,
                subjectId,
                topicId,
                durationMinutes,
                isLive
            }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<Test[]>({ 
                code: StatusCode.OK, 
                data: [updatedTest], 
                message: "Test updated successfully" 
            })
        );
    } catch (error) {
        console.error("Error updating test:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const deleteTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const testId = parseInt(id);
        if (isNaN(testId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid test ID" 
                })
            );
        }

        // Check if test exists
        const existingTest = await prisma.test.findUnique({
            where: { id: testId }
        });

        if (!existingTest) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Test not found" 
                })
            );
        }

        // Delete the test
        await prisma.test.delete({
            where: { id: testId }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<[]>({ 
                code: StatusCode.OK, 
                data: [], 
                message: "Test deleted successfully" 
            })
        );
    } catch (error) {
        console.error("Error deleting test:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
}; 