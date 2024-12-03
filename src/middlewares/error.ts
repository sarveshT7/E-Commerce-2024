import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorClass.js";
import { ControllerTypes } from "../types/types.js";

export const errorMiddleware = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    err.message ||= "Intrnal server error"
    err.statusCode ||= 500

    res.status(err.statusCode).json({
        message: err.message,
        success: false
    })
}
// export const TryCatch = (func: ControllerTypes) =>
//     (req: Request, res: Response, next: NextFunction) => {
//         return Promise.resolve(func(req, res, next)).catch(next)
//     }

export const TryCatch = (func: ControllerTypes) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await func(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};
