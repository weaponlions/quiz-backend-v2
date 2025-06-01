import { NextFunction, Request, Response } from "express";
import { customLogger } from "../logger";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl } = req;  
    const user = 'Anonymous';
    // const user = req.user ? req.user.username : 'Anonymous';
    
    res.on('finish', () => {
      customLogger.info('Request handled', {
        urlPath: originalUrl,
        requestedUser: user,
        status: res.statusCode,
        message: `${method} request completed`, 
      });
    });
  
    next(); 
  };