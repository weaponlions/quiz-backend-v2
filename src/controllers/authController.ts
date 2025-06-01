import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authSchema } from "../validators/schemaValidator";
import { jsonResponse } from "../helpers";
import { StatusCode } from "../types";
import Joi from "joi";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const registerUser = async (req: Request, res: Response) => {
  try {

    const joiResult: Joi.ValidationResult = authSchema.validate(req.body, { abortEarly: false });
    if (joiResult.error) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: joiResult.error.details
      }));
      return
    }

    const { username, password, userType } = joiResult.value;
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(StatusCode.CONFLICT).json(jsonResponse<[]>({
        code: StatusCode.CONFLICT,
        data: [],
        message: "Username already exists"
      }));
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, userType }
    });

    res.status(StatusCode.CREATED).json(jsonResponse<{id: number, username: string, userType: string}[]>({
      code: StatusCode.CREATED,
      data: [{ id: user.id, username: user.username, userType: user.userType }],
      message: "User registered successfully"
    }));
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
      code: StatusCode.INTERNAL_SERVER_ERROR,
      data: [],
      message: "Unexpected error occurred"
    }));
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const joiResult: Joi.ValidationResult = authSchema.validate(req.body, { abortEarly: false });
    if (joiResult.error) {
      res.status(StatusCode.BAD_REQUEST).json(jsonResponse<[]>({
        code: StatusCode.BAD_REQUEST,
        data: [],
        message: joiResult.error.details
      }));
      return
    }

    const { username, password } = joiResult.value;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(StatusCode.UNAUTHORIZED).json(jsonResponse<[]>({
        code: StatusCode.UNAUTHORIZED,
        data: [],
        message: "Invalid credentials"
      }));
      return
    }

    const token = jwt.sign({ id: user.id, username: user.username, userType: user.userType }, JWT_SECRET, { expiresIn: "7d" });

    res.status(StatusCode.OK).json(jsonResponse<object[]>({
      code: StatusCode.OK,
      data: [{ token }], 
      message: "Login successful"
    }));
  } catch (error) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(jsonResponse<[]>({
      code: StatusCode.INTERNAL_SERVER_ERROR,
      data: [],
      message: "Unexpected error occurred"
    }));
  }
};
