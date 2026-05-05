import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { reviewController } from "../controllers/reviewController";



const router = Router();

router.post('/create', authMiddleware, reviewController.createReview);

export default router;