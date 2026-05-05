import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../config/upload";
import { notificationController } from "../controllers/notificationController";

const router = Router();



router.get('/info', userController.getInfo);
router.get('/profile/:id?', userController.getProfile);
router.post('/profile', authMiddleware, upload.single('avatar'), userController.updateProfile);
router.get('/notifications', authMiddleware, userController.getNotifications);          
router.patch('/notifications/read-all', authMiddleware, notificationController.markAsRead); 
router.delete('/notifications/:id', authMiddleware, notificationController.deleteNotification); 

export default router;