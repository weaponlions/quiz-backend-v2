import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import { roundSchema } from "../validators/schemaValidator";
import { Round, StatusCode } from "../types";
import { isObjectEmpty, jsonResponse } from "../helpers";

export const createRound = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();

        const joiResult: Joi.ValidationResult<Round> = roundSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
                code: StatusCode.BAD_REQUEST,
                data: [],
                message: joiResult.error.details
            }));
            return;
        }

        await prisma.examRound.create({
            data: {
                roundName: joiResult.value.roundName,
                sectionName: joiResult.value.sectionName,
                roundType: joiResult.value.roundType,
                exam: { connect: { id: joiResult.value.examId } },
                owner: { connect: { id: joiResult.value.ownerId } },
                accessType: joiResult.value.accessType,
                active: joiResult.value.active
            }
        })
        .then((value) => {
            res.status(StatusCode.CREATED).json(jsonResponse<Round[]>({
                code: StatusCode.CREATED,
                data: [value],
                message: "Round created successfully"
            }));
        })
        .catch((err) => {
            res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
                code: StatusCode.BAD_REQUEST,
                data: [],
                message: err
            }));
        });

    } catch (error) {
        console.log("Unexpected error:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
            code: StatusCode.INTERNAL_SERVER_ERROR,
            data: [],
            message: "An unexpected error occurred."
        }));
    }
};


export const getRound = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        let query: any = {};

        if (isObjectEmpty(req.query) === false) {
            const { type, value, examId }: { type?: string, value?: string, examId?: number } = req.query as any;

            const queryArr: any[] = [];

            if (type === "round" && value) {
                const { error, value: roundValue } = Joi.string().validate(value);
                if (error) {
                    res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
                        code: StatusCode.BAD_REQUEST,
                        data: [],
                        message: "Invalid round name."
                    }));
                    return;
                }
                queryArr.push({
                    roundName: {
                        contains: roundValue
                    }
                });
            }

            if (examId) {
                const { error: examIdErr, value: examIdValue } = Joi.number().validate(Number(examId));
                if (examIdErr) {
                    res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
                        code: StatusCode.BAD_REQUEST,
                        data: [],
                        message: "Invalid examId."
                    }));
                    return;
                }
                queryArr.push({
                    examId: examIdValue
                });
            }

            if (queryArr.length > 0) {
                query.where = Object.assign({}, ...queryArr);
            }
        }

        await prisma.examRound.findMany(query)
            .then((value) => {
                res.status(StatusCode.OK).json(jsonResponse<Round[]>({
                    code: StatusCode.OK,
                    data: value,
                    message: "Round list"
                }));
            })
            .catch((err) => {
                res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
                    code: StatusCode.BAD_REQUEST,
                    data: [],
                    message: err
                }));
            });

    } catch (error) {
        console.log("Unexpected error:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
            code: StatusCode.INTERNAL_SERVER_ERROR,
            data: [],
            message: "An unexpected error occurred."
        }));
    }
};
