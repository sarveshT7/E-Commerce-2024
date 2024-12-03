export const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Intrnal server error");
    err.statusCode || (err.statusCode = 500);
    res.status(err.statusCode).json({
        message: err.message,
        success: false
    });
};
// export const TryCatch = (func: ControllerTypes) =>
//     (req: Request, res: Response, next: NextFunction) => {
//         return Promise.resolve(func(req, res, next)).catch(next)
//     }
export const TryCatch = (func) => {
    return async (req, res, next) => {
        try {
            await func(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
};
