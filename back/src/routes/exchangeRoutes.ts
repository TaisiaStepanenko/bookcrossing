import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { exchangeController } from "../controllers/exchangeController";



const router = Router();

router.post('/add/:id', authMiddleware, exchangeController.addExchange);
router.get('/incoming', authMiddleware, exchangeController.getIncomingExchanges);
router.patch('/incoming/rejectAll/:bookId', authMiddleware, exchangeController.cancelAllBookExchanges);

router.get('/:type/:id?', authMiddleware, exchangeController.getAllExchanges);
router.patch('/change/:id', authMiddleware, exchangeController.changeStatus);

export default router;


