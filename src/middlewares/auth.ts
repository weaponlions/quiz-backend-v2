import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/jwt";
import { StatusCode } from "../types";
import { jsonResponse } from "../helpers";



export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(StatusCode.UNAUTHORIZED).json(jsonResponse({ code: StatusCode.UNAUTHORIZED, data: [], message: "Missing or invalid token" }));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);;
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(StatusCode.UNAUTHORIZED).json(jsonResponse({ code: StatusCode.UNAUTHORIZED, data: [], message: "Invalid token" }));
    }
};
