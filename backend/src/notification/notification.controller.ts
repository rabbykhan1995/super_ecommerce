import NotificationService from "./notification.service";
import { Request, Response } from "express";

export default class NotificationController {
    static async create(req:Request, res:Response) {
        const notification = await NotificationService.create(req.body);

        return res.status(201).json({success:true});
    }

        static async linkDevice(req:Request, res:Response) {
        
        const deviceID = req.params.deviceID.toString();

        const notification = await NotificationService.update(deviceID,req.body);

        return res.status(201).json({success:true});
    }



}