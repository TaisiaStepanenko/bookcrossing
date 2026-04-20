import { Router } from "express";
import { registration, login } from "../controllers/authController";

const router = Router();

router.post('/user/registration', registration);
router.post('/user/login', login);

export default router;

