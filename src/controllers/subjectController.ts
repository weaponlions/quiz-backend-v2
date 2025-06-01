import { Request, Response } from "express";
import { subjectSchema } from "../validators/schemaValidator";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
import { StatusCode, Subject } from "../types";
import { isObjectEmpty, jsonResponse } from "../helpers";

export const createSubject = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();

        const joiResult = subjectSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { name } = joiResult.value;

        // Check if subject with same name already exists
        const existingSubject = await prisma.subject.findUnique({
            where: { name }
        });

        if (existingSubject) {
            return res.status(StatusCode.CONFLICT).json(
                jsonResponse<[]>({ 
                    code: StatusCode.CONFLICT, 
                    data: [], 
                    message: "A subject with this name already exists" 
                })
            );
        }

        const newSubject = await prisma.subject.create({
            data: { name }
        });

        return res.status(StatusCode.CREATED).json(
            jsonResponse<Subject[]>({ 
                code: StatusCode.CREATED, 
                data: [newSubject], 
                message: "Subject created successfully" 
            })
        );
    } catch (error) {
        console.error("Error creating subject:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getSubjects = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        
        const subjects = await prisma.subject.findMany({
            include: {
                _count: {
                    select: {
                        topics: true,
                        questions: true,
                        tests: true,
                        exams: true
                    }
                }
            }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: subjects, 
                message: "Subjects retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving subjects:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getSubjectById = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        const { id } = req.params;

        const subjectId = parseInt(id);
        if (isNaN(subjectId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid subject ID" 
                })
            );
        }

        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                topics: true,
                exams: {
                    include: {
                        exam: true
                    }
                },
                _count: {
                    select: {
                        questions: true,
                        tests: true
                    }
                }
            }
        });

        if (!subject) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Subject not found" 
                })
            );
        }

        return res.status(StatusCode.OK).json(
            jsonResponse<any[]>({ 
                code: StatusCode.OK, 
                data: [subject], 
                message: "Subject retrieved successfully" 
            })
        );
    } catch (error) {
        console.error("Error retrieving subject:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const updateSubject = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        const { id } = req.params;

        const subjectId = parseInt(id);
        if (isNaN(subjectId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid subject ID" 
                })
            );
        }

        // Check if subject exists
        const existingSubject = await prisma.subject.findUnique({
            where: { id: subjectId }
        });

        if (!existingSubject) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Subject not found" 
                })
            );
        }

        const joiResult = subjectSchema.validate(req.body, { abortEarly: false });
        if (joiResult.error) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: joiResult.error.details 
                })
            );
        }

        const { name } = joiResult.value;

        // Check if another subject with same name exists
        if (name !== existingSubject.name) {
            const duplicateSubject = await prisma.subject.findUnique({
                where: { name }
            });

            if (duplicateSubject) {
                return res.status(StatusCode.CONFLICT).json(
                    jsonResponse<[]>({ 
                        code: StatusCode.CONFLICT, 
                        data: [], 
                        message: "A subject with this name already exists" 
                    })
                );
            }
        }

        const updatedSubject = await prisma.subject.update({
            where: { id: subjectId },
            data: { name }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<Subject[]>({ 
                code: StatusCode.OK, 
                data: [updatedSubject], 
                message: "Subject updated successfully" 
            })
        );
    } catch (error) {
        console.error("Error updating subject:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient();
        const { id } = req.params;

        const subjectId = parseInt(id);
        if (isNaN(subjectId)) {
            return res.status(StatusCode.BAD_REQUEST).json(
                jsonResponse<[]>({ 
                    code: StatusCode.BAD_REQUEST, 
                    data: [], 
                    message: "Invalid subject ID" 
                })
            );
        }

        // Check if subject exists
        const existingSubject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                _count: {
                    select: {
                        topics: true,
                        questions: true,
                        tests: true,
                        exams: true
                    }
                }
            }
        });

        if (!existingSubject) {
            return res.status(StatusCode.NOT_FOUND).json(
                jsonResponse<[]>({ 
                    code: StatusCode.NOT_FOUND, 
                    data: [], 
                    message: "Subject not found" 
                })
            );
        }

        // Check if subject has associated records
        const associatedRecordsCount = 
            existingSubject._count.topics + 
            existingSubject._count.questions + 
            existingSubject._count.tests +
            existingSubject._count.exams;

        if (associatedRecordsCount > 0) {
            return res.status(StatusCode.CONFLICT).json(
                jsonResponse<[]>({ 
                    code: StatusCode.CONFLICT, 
                    data: [], 
                    message: "Cannot delete subject with associated topics, questions, tests, or exams" 
                })
            );
        }

        // Delete the subject
        await prisma.subject.delete({
            where: { id: subjectId }
        });

        return res.status(StatusCode.OK).json(
            jsonResponse<[]>({ 
                code: StatusCode.OK, 
                data: [], 
                message: "Subject deleted successfully" 
            })
        );
    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
            jsonResponse<[]>({ 
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                data: [], 
                message: "An unexpected error occurred" 
            })
        );
    }
};

export const getSubject = async (req: Request, res: Response) => {
    try {
      const prisma = new PrismaClient();
      let query: { where: any } = { where: {} };
  
      if (!isObjectEmpty(req.query)) {
        const {
          subjectName,
          examId,
          active,
        }: { subjectName?: string; examId?: number; active?: string } =
          req.query as any;
  
        const queryArr: any[] = [];
  
        // Validate inputs
        const { error: nameError, value: subjectValue } = Joi.string().validate(subjectName);
        const { error: examError, value: examIdValue } = Joi.number().validate(examId);
        const { error: activeError, value: activeValue } = Joi.boolean().truthy("true").falsy("false").validate(active);
  
        if (nameError && subjectName) {
          res.status(StatusCode.BAD_REQUEST).json(
            jsonResponse<[]>({
              code: StatusCode.BAD_REQUEST,
              data: [],
              message: "Invalid query parameter: subjectName",
              other: nameError.details,
            })
          );
          return
        }
  
        if (examError && examId) {
          res.status(StatusCode.BAD_REQUEST).json(
            jsonResponse<[]>({
              code: StatusCode.BAD_REQUEST,
              data: [],
              message: "Invalid query parameter: examId",
              other: examError.details,
            })
          );
          return
        }
  
        if (activeError && active !== undefined) {
          res.status(StatusCode.BAD_REQUEST).json(
            jsonResponse<[]>({
              code: StatusCode.BAD_REQUEST,
              data: [],
              message: "Invalid query parameter: active",
              other: activeError.details,
            })
          );
          return
        }
  
        if (!nameError && subjectName) {
          queryArr.push({
            subjectName: {
              contains: subjectValue,
              mode: "insensitive", // optional: makes it case-insensitive
            },
          });
        }
  
        if (!examError && examId) {
          queryArr.push({
            examId: examIdValue,
          });
        }
  
        if (!activeError && active !== undefined) {
          queryArr.push({
            active: activeValue,
          });
        }
  
        // Combine all conditions
        if (queryArr.length > 0) {
          query.where = {
            ...queryArr.reduce((acc, item) => ({ ...acc, ...item }), {}),
          };
        }
      }
  
      const subjects = await prisma.examSubject.findMany(query);
  
      res.status(StatusCode.OK).json(
        jsonResponse<Subject[]>({
          code: StatusCode.OK,
          data: subjects,
          message: "Subject list",
        })
      );
    } catch (error) {
      console.error("Unexpected error in getSubject:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        jsonResponse<[]>({
          code: StatusCode.INTERNAL_SERVER_ERROR,
          data: [],
          message: "An unexpected error occurred.",
        })
      );
    }
    return
  };
  
