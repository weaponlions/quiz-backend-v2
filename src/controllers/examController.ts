import { Request, Response } from "express";
import { examSchema, examSubjectArraySchema, examSubjectSchema } from "../validators/schemaValidator";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import { Exam, ExamBoard, StatusCode, ExamSubject } from "../types";
import { isObjectEmpty, jsonResponse } from "../helpers";
import { createSubjectService } from "./../services/subjectService";

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

export const addExamSubject = async (req: Request, res: Response) => {
  try {
    const joiResult = examSubjectArraySchema.validate(req.body, { abortEarly: false });
    if (joiResult.error) {
      return res.status(StatusCode.BAD_REQUEST).json(
        jsonResponse<[]>({
          code: StatusCode.BAD_REQUEST,
          data: [],
          message: joiResult.error.details
        })
      );
    }



    let dataToInsert: ExamSubject[] = joiResult.value;
    let newToInsert: ExamSubject[] = [];

    for (let i = 0; i < dataToInsert.length; i++) {
      const element = dataToInsert[i];
      if (element.subjectName) {
        const res = await createSubjectService(element.subjectName);
        
        if (res.success === true && res.results.id) {
          newToInsert.push({
            examId: element.examId,
            subjectId: res.results?.id
          })
        }
      }
    }
    
    const createdSubjects = await prisma.examSubject.createMany({
      data: newToInsert,
      // skipDuplicates: true // optional: prevents duplicate insert errors
    });

    res.status(StatusCode.CREATED).json(
      jsonResponse({
        code: StatusCode.CREATED,
        data: createdSubjects,
        message: "Records created successfully"
      })
    );

  } catch (error) {
    console.error("Unexpected error in addExamSubject:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
      jsonResponse<[]>({
        code: StatusCode.INTERNAL_SERVER_ERROR,
        data: [],
        message: "An unexpected error occurred."
      })
    );
  }
};

export const getExamSubject = async (req: Request, res: Response) => {
  try {
    const { examId, subjectId } = req.query;

    // Validate input
    if (!examId && !subjectId) {
      return res.status(StatusCode.BAD_REQUEST).json(
        jsonResponse<[]>({
          code: StatusCode.BAD_REQUEST,
          data: [],
          message: "Please provide either examId or subjectId as a query parameter."
        })
      );
    }

    // Build dynamic filter
    const filter: any = {};
    if (examId) filter.examId = Number(examId);
    if (subjectId) filter.subjectId = Number(subjectId); 

    const results = await prisma.examSubject.findMany({
      where: filter,
      include: {
        exam: true,     // Include full exam data
        subject: true   // Include full subject data
      }
    });

    res.status(StatusCode.OK).json(
      jsonResponse({
        code: StatusCode.OK,
        data: results,
        message: "Records fetched successfully"
      })
    );

  } catch (error) {
    console.error("Error fetching exam subjects:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
      jsonResponse<[]>({
        code: StatusCode.INTERNAL_SERVER_ERROR,
        data: [],
        message: "An unexpected error occurred."
      })
    );
  }
};



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



export const deleteExamSubject = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(StatusCode.BAD_REQUEST).json(
        jsonResponse<[]>({
          code: StatusCode.BAD_REQUEST,
          data: [],
          message: "Please provide an array of IDs to delete."
        })
      );
    }

    const deleted = await prisma.examSubject.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    res.status(StatusCode.OK).json(
      jsonResponse({
        code: StatusCode.OK,
        data: deleted,
        message: `${deleted.count} record(s) deleted successfully.`
      })
    );
  } catch (error) {
    console.error("Bulk delete failed:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
      jsonResponse<[]>({
        code: StatusCode.INTERNAL_SERVER_ERROR,
        data: [],
        message: "An unexpected error occurred."
      })
    );
  }
};


export const updateExamSubject = async (req: Request, res: Response) => {
  try {
    const updates: Array<{ id: number; examId?: number; subjectId?: number }> = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(StatusCode.BAD_REQUEST).json(
        jsonResponse<[]>({
          code: StatusCode.BAD_REQUEST,
          data: [],
          message: "Please provide an array of updates with ID and fields to update."
        })
      );
    }

    const updatedRecords = await Promise.all(
      updates.map(({ id, examId, subjectId }) =>
        prisma.examSubject.update({
          where: { id },
          data: {
            ...(examId !== undefined && { examId }),
            ...(subjectId !== undefined && { subjectId })
          }
        })
      )
    );

    res.status(StatusCode.OK).json(
      jsonResponse({
        code: StatusCode.OK,
        data: updatedRecords,
        message: "Records updated successfully"
      })
    );
  } catch (error) {
    console.error("Bulk update failed:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
      jsonResponse<[]>({
        code: StatusCode.INTERNAL_SERVER_ERROR,
        data: [],
        message: "An unexpected error occurred."
      })
    );
  }
};
