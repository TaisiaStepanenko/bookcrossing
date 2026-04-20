import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { exchangeController } from "../controllers/exchangeController";



const router = Router();

router.post('/add/:id', authMiddleware, exchangeController.addExchange);
router.get('/incoming', authMiddleware, exchangeController.getIncomingExchanges);
router.patch('/incoming/rejectAll/:bookId', authMiddleware, exchangeController.cancelAllBookExchanges);

router.get('/incoming/:id', authMiddleware, exchangeController.getAllIncomingExchangesById);
router.patch('/incoming/reject/:id', authMiddleware, exchangeController.cancelBookExchangeById);
router.patch('/accept/:id', authMiddleware, exchangeController.acceptExchange);

export default router;


