import { Router } from "express";
import { bookController } from "../controllers/bookController";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../config/upload";


const router = Router();

router.post('', bookController.getCatalog);
router.get('/:id', bookController.getBookById);
router.post('/favorite/:id', authMiddleware, bookController.addBookToFavorites);

router.put('/add', authMiddleware, upload.array('photos', 7), bookController.addNewBook);
router.post('/edit/:id', authMiddleware, upload.array('photos', 7), bookController.updateBookInfo);
router.delete('/delete/:id', authMiddleware, bookController.deleteBook);

export default router;