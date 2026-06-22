import { Request, Response } from "express";

export class ContactController{
    constructor(){}
    static async sendContactMessage(req:Request,res:Response){
     res.status(201).json({msg:"email send successfully", data:req});   
    }
}

