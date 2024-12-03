import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    role?: string;
    gender: string;
    dob: Date;
}
export interface SearchRequestQuery {
    search?: string;
    sort?: string;
    category?: string;
    price?: string
}
export interface NewProductRequestBody {
    name: string;
    category: string;
    price: number;
    stock: number;
    photo: string;
}

export type ControllerTypes = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void | Response<any>>;

export interface BaseQuery {
    name?: {
        $regex: string;
        $options: string;
    };
    price?: { $lte: number };
    category?: string;
}