import { Request, Response } from "express";
import { examSchema } from "../validators/schemaValidator";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import { Exam, ExamBoard, StatusCode } from "../types";
import { isObjectEmpty, jsonResponse } from "../helpers";

const prisma = new PrismaClient();

export const createExam = async (req: Request, res: Response) => {
  try {

    const joiResult: Joi.ValidationResult<Exam> = examSchema.validate(req.body, { abortEarly: false });
    if (joiResult.error) {

      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({ code: StatusCode.BAD_REQUEST, data: [], message: joiResult.error.details }))
      return
    }

    await prisma.exam.create({
      data: {
        name: joiResult.value.name,
        board: joiResult.value.board,
        level: joiResult.value.level
      }
    }).then((value) => {
      res.status(StatusCode.CREATED).json(jsonResponse<Exam[]>({ code: StatusCode.CREATED, data: [value], message: "Record created successful" }))
    })
      .catch((err) => {
        res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({ code: StatusCode.BAD_REQUEST, data: [], message: err }))
      })

  } catch (error) {
    if (error instanceof Error) {

    } else {
      console.log("An unexpected error occurred.");
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({ code: StatusCode.INTERNAL_SERVER_ERROR, data: [], message: "An unexpected error occurred." }))
    }
  }
}

export const updateExam = async (req: Request<{ examId: number }>, res: Response) => {
  try {

    const { examId }: { examId: number } = req.params;

    const joiResult: Joi.ValidationResult<Exam> = examSchema.validate(req.body, { abortEarly: false });
    if (joiResult.error) {

      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({ code: StatusCode.BAD_REQUEST, data: [], message: joiResult.error.details }))
      return
    }

    const { error, value: examIdValue } = Joi.number().validate(examId);
    if (error && examIdValue) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({ code: StatusCode.BAD_REQUEST, data: [], message: "Invalid examId parameters values.", other: error.details }))
      return;
    }

    await prisma.exam.update({
      where: { id: examIdValue },
      data: {
        name: joiResult.value.name,
        board: joiResult.value.board,
        level: joiResult.value.level,
        updatedAt: new Date()
      }
    }).then((value) => {
      res.status(StatusCode.ACCEPTED).json(jsonResponse<Exam[]>({ code: StatusCode.CREATED, data: [value], message: "Record update successful" }))
    })
      .catch((err) => {
        res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({ code: StatusCode.BAD_REQUEST, data: [], message: err }))
      })

  } catch (error) {
    if (error instanceof Error) {


    } else {
      console.log("An unexpected error occurred.");
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({ code: StatusCode.INTERNAL_SERVER_ERROR, data: [], message: "An unexpected error occurred." }))
    }
  }
}



export const getExam = async (req: Request, res: Response) => {
  try {

    let query: undefined | Object = undefined;

    if (!isObjectEmpty(req.query)) {
      if (req.query.type && req.query.value) {
        const { error, value } = Joi.string().validate(req.query.value);
        if (
          error ||
          !["board", "exam"].includes(req.query.type as string)
        ) {
          res.status(StatusCode.BAD_REQUEST).json(
            jsonResponse<[]>({
              code: StatusCode.BAD_REQUEST,
              data: [],
              message: "Invalid query parameters values.",
            })
          );
          return;
        }

        // Remove `active: true` condition to allow both active and inactive
        if (req.query.type === "board") {
          query = {
            where: {
              board: {
                contains: value,
              },
            },
          };
        } else if (req.query.type === "exam") {
          query = {
            where: {
              name: {
                contains: value,
              },
            },
          };
        }
      } else {
        res.status(StatusCode.BAD_REQUEST).json(
          jsonResponse<[]>({
            code: StatusCode.BAD_REQUEST,
            data: [],
            message: "Invalid query parameters",
          })
        );
        return;
      }
    }

    await prisma.exam
      .findMany(query || {}) // <-- this line now returns all records
      .then((value) => {
        res.status(StatusCode.OK).json(
          jsonResponse<Exam[]>({
            code: StatusCode.OK,
            data: value,
            message: "Record list",
          })
        );
      })
      .catch((err) => {
        res.status(StatusCode.BAD_REQUEST).json(
          jsonResponse<[]>({
            code: StatusCode.BAD_REQUEST,
            data: [],
            message: err,
          })
        );
      });
  } catch (error) {
    console.log("An unexpected error occurred.");
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
      jsonResponse<[]>({
        code: StatusCode.INTERNAL_SERVER_ERROR,
        data: [],
        message: "An unexpected error occurred.",
      })
    );
  }
};
