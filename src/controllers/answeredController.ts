import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import { StatusCode, AttemptAnswer } from "../types";
import { jsonResponse, isObjectEmpty } from "../helpers";
import { attemptAnswerSchema } from "../validators/schemaValidator";

const prisma = new PrismaClient();

// Create
export const addAttemptAnswer = async (req: Request, res: Response) => {
  try {
    const joiResult: Joi.ValidationResult<AttemptAnswer> = attemptAnswerSchema.validate(req.body, { abortEarly: false });

    if (joiResult.error) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: joiResult.error.details,
      }));
      return;
    }

    await prisma.attemptAnswer.create({
      data: {
        attemptId: joiResult.value.attemptId,
        questionId: joiResult.value.questionId,
        selectedOption: joiResult.value.selectedOption ?? null, 
        isCorrect: joiResult.value.isCorrect,
      }
    }).then((value) => {
      res.status(StatusCode.CREATED).json(jsonResponse<AttemptAnswer[]>({
        code: StatusCode.CREATED,
        data: [value],
        message: "Answer recorded successfully"
      }));
    }).catch((err) => {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: err
      }));
    });

  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
      code: StatusCode.INTERNAL_SERVER_ERROR,
      data: [],
      message: "An unexpected error occurred."
    }));
  }
};

// Get
export const getAttemptAnswer = async (req: Request, res: Response) => {
  try {
    let query: { where: Object | undefined } = { where: undefined };

    if (!isObjectEmpty(req.query)) {
      const { attemptedTestId, questionId } = req.query as any;

      const queryArr: Object[] = [];

      const validateId = (id: any) => Joi.number().validate(id);

      if (attemptedTestId) {
        const { error, value } = validateId(attemptedTestId);
        if (error) {
          res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
            code: StatusCode.BAD_REQUEST,
            data: [],
            message: "Invalid attemptedTestId"
          }));
          return;
        }
        queryArr.push({ attemptedTestId: value });
      }

      if (questionId) {
        const { error, value } = validateId(questionId);
        if (error) {
          res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
            code: StatusCode.BAD_REQUEST,
            data: [],
            message: "Invalid questionId"
          }));
          return;
        }
        queryArr.push({ questionId: value });
      }

      if (queryArr.length > 0) {
        queryArr.forEach((v) => {
          query = {
            where: {
              ...((query.where) ? query.where : {}),
              ...v
            }
          };
        });
      }
    }

    await prisma.attemptAnswer.findMany(typeof query.where !== "undefined" ? query as Object : {})
      .then((value) => {
        res.status(StatusCode.OK).json(jsonResponse<AttemptAnswer[]>({
          code: StatusCode.OK,
          data: value,
          message: "Answer list"
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
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
      code: StatusCode.INTERNAL_SERVER_ERROR,
      data: [],
      message: "An unexpected error occurred."
    }));
  }
};

