import { Router } from "express";
import { notificationController } from "../controllers/notificationController";


const router = Router();

router.patch('/notifications/read-all', notificationController.markAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

export default router;