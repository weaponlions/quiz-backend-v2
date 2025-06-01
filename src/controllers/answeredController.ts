import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import { StatusCode, AnsweredQuestion } from "../types";
import { jsonResponse, isObjectEmpty } from "../helpers";
import { answeredQuestionSchema } from "../validators/schemaValidator";

const prisma = new PrismaClient();

// Create
export const createAnsweredQuestion = async (req: Request, res: Response) => {
  try {
    const joiResult: Joi.ValidationResult<AnsweredQuestion> = answeredQuestionSchema.validate(req.body, { abortEarly: false });

    if (joiResult.error) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: joiResult.error.details,
      }));
      return;
    }

    await prisma.answeredQuestion.create({
      data: {
        attemptedTestId: joiResult.value.attemptedTestId,
        questionId: joiResult.value.questionId,
        chosenOption: joiResult.value.chosenOption ?? null,
        correctOption: joiResult.value.correctOption,
        isCorrect: joiResult.value.isCorrect,
        attempted: joiResult.value.attempted,
      }
    }).then((value) => {
      res.status(StatusCode.CREATED).json(jsonResponse<AnsweredQuestion[]>({
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
export const getAnsweredQuestion = async (req: Request, res: Response) => {
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

    await prisma.answeredQuestion.findMany(typeof query.where !== "undefined" ? query as Object : {})
      .then((value) => {
        res.status(StatusCode.OK).json(jsonResponse<AnsweredQuestion[]>({
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

// Update
export const updateAnsweredQuestion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { error: idError } = Joi.number().required().validate(id);

    if (idError) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: "Invalid answer ID"
      }));
      return;
    }

    const joiResult = answeredQuestionSchema.validate(req.body, { abortEarly: false });
    if (joiResult.error) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: joiResult.error.details
      }));
      return;
    }

    const updated = await prisma.answeredQuestion.update({
      where: { id },
      data: {
        attemptedTestId: joiResult.value.attemptedTestId,
        questionId: joiResult.value.questionId,
        chosenOption: joiResult.value.chosenOption ?? null,
        correctOption: joiResult.value.correctOption,
        isCorrect: joiResult.value.isCorrect,
        attempted: joiResult.value.attempted,
      }
    });

    res.status(StatusCode.OK).json(jsonResponse<AnsweredQuestion[]>({
      code: StatusCode.OK,
      data: [updated],
      message: "Answer updated successfully"
    }));

  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
      code: StatusCode.INTERNAL_SERVER_ERROR,
      data: [],
      message: "An unexpected error occurred."
    }));
  }
};
