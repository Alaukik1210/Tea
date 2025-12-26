import { NextFunction, Request, RequestHandler, Response } from "express";

const tryCatch = (handler: RequestHandler):RequestHandler=>{
    return async (req:Request,res :Response,next:NextFunction)=>{
        try {
            await handler(req,res,next);
        } catch (error) {
            next(error);
        }
    }
}

export default tryCatch;