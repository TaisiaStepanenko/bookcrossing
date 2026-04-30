import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../config/upload";
import { notificationController } from "../controllers/notificationController";

const router = Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

router.get('/info', userController.getInfo);
router.get('/profile/:id?', userController.getProfile);
router.post('/profile', upload.single('avatar'), userController.updateProfile);
router.get('/notifications', userController.getNotifications);          
router.patch('/notifications/read-all', notificationController.markAsRead); 
router.delete('/notifications/:id', notificationController.deleteNotification); 

export default router;