import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get('/info', userController.getInfo);
router.get('/profile/:id?', userController.getProfile);
router.post('/profile', userController.updateProfile);
router.get('/notifications/:id', userController.getNotifications);

export default router;
