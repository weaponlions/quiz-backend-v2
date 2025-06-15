import { Request, Response } from "express";
import { testAttemptSchema, updateTestAttemptSchema } from "../validators/schemaValidator";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import { StatusCode, AttemptedTest } from "../types";
import { isObjectEmpty, jsonResponse } from "../helpers";

export const createAttemptedTest = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();

    const joiResult: Joi.ValidationResult<AttemptedTest> = testAttemptSchema.validate(req.body, { abortEarly: false });
    if (joiResult.error) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: joiResult.error.details
      }));
      return;
    }

    await prisma.testAttempt.create({
      data: {
        userId: joiResult.value.userId,  
        testId: joiResult.value.testId, 
        score: joiResult.value.score, 
        // submittedAt: joiResult.value.submittedAt ?? new Date()
      }
    }).then((value) => {
      res.status(StatusCode.CREATED).json(jsonResponse<AttemptedTest[]>({
        code: StatusCode.CREATED,
        data: [value],
        message: "Attempt saved successfully"
      }));
    }).catch((err) => {
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
 

export const getAttemptedTest = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    let query: { where: Object | undefined } = { where: undefined };

    if (!isObjectEmpty(req.query)) {
      const {
        userId,
        testId
      }: {
        userId?: number;
        testId?: number;
      } = req.query as any;

      const queryArr: Object[] = [];

      const validateNumber = (value: any) => Joi.number().validate(value);

      const validators = [
        { value: userId, name: "userId" },
        { value: testId, name: "testId" }
      ];

      for (const { value, name } of validators) {
        if (value !== undefined) {
          const { error, value: numValue } = validateNumber(value);
          if (error) {
            res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
              code: StatusCode.BAD_REQUEST,
              data: [],
              message: `Invalid ${name}`
            }));
            return;
          }
          queryArr.push({ [name]: numValue });
        }
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

    await prisma.testAttempt.findMany(typeof query.where !== "undefined" ? query as Object : {})
      .then((value) => {
        res.status(StatusCode.OK).json(jsonResponse<AttemptedTest[]>({
          code: StatusCode.OK,
          data: value,
          message: "Attempt list"
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





export const updateAttemptedTest = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    const id = Number(req.params.id);
    const { error: idError } = Joi.number().required().validate(id);

    if (idError) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: "Invalid attempt ID"
      }));
      return;
    }

    const joiResult = updateTestAttemptSchema.validate(req.body, { abortEarly: false });

    if (joiResult.error) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: joiResult.error.details
      }));
      return;
    }

    const updated = await prisma.testAttempt.update({
      where: { id },
      data: {
        score: joiResult.value.score,
        submittedAt: joiResult.value.submittedAt ?? new Date()
      }
    });

    res.status(StatusCode.OK).json(jsonResponse<AttemptedTest[]>({
      code: StatusCode.OK,
      data: [updated],
      message: "Attempt updated successfully"
    }));

  } catch (error) {
    console.log("Unexpected error:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
      code: StatusCode.INTERNAL_SERVER_ERROR,
      data: [],
      message: "An unexpected error occurred."
    }));
  }
};
