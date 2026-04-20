import { notificationService } from "../services/notificationService"
import { Request, Response } from "express";


export const notificationController = {

    async markAsRead(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const result = await notificationService.markAsRead(userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },

    
    async deleteNotification(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const notificationId = parseInt(req.params.id);
            if (isNaN(notificationId)) {
                return res.status(400).json({ message: 'Invalid notification id' });
            }
            const result = await notificationService.deleteNotification(notificationId, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },

   
}