import { NextFunction, Request, Response } from "express";
import { NotfoundError } from "../lib/errors.js";



export function NotfoundHandler(_req:Request , _res:Response,next:NextFunction){
    next(new NotfoundError("route not found"));
}