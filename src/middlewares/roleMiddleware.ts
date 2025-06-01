import { Request, Response, NextFunction } from "express";
import { jsonResponse } from "../helpers";
import { StatusCode } from "../types";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { userType: string };

    if (!user || !allowedRoles.includes(user.userType)) {
      return res.status(StatusCode.FORBIDDEN).json(jsonResponse<[]>({
        code: StatusCode.FORBIDDEN,
        data: [],
        message: "You are not authorized to access this resource.",
      }));
    }

    next();
  };
};


//router.get("/admin-only", authenticateUser, authorizeRoles("ADMIN"), handlerFn);
