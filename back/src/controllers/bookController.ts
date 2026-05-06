import { z } from 'zod';
import { Request, Response } from 'express';
import { bookService } from '../services/bookService';
import { Place, ExchangeMethod, BookCondition, ExchangeType, BookCover } from '../constants/enums';
import { verifyToken } from '../utils/jwt';

const catalogFilterSchema = z.object({
    cityId: z.number().int().positive().optional(),
    place: z.array(z.enum(['MY_PLACE', 'NEAR', 'RUSSIA'])).optional(),
    exchangeMethod: z.array(z.enum(['MEETING', 'DELIVERY', 'ALL'])).optional(),
    condition: z.array(z.enum(['EXCELLENT', 'GOOD', 'SATISFACTORY', 'POOR'])).optional(),
    exchange: z.array(z.enum(['EXCHANGE', 'FREE'])).optional(),
    page: z.number().int().default(0),
    myBook: z.boolean().optional(),
    favorite: z.boolean().optional(),
    search: z.string().optional(),
});

export const bookEditSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    photos: z.array(
        z.object({
            isMain: z.boolean(),
            url: z.string().url('Некорректный URL фото'),
        })
    ).optional(),
    deletedPhotos: z.array(z.string()).optional(),
    exchangeType: z.nativeEnum(ExchangeType, { message: 'Выберите тип обмена' }),
    exchangeMethod: z.nativeEnum(ExchangeMethod, { message: 'Выберите способ обмена' }),
    author: z.string().min(1, 'Автор обязателен'),
    condition: z.nativeEnum(BookCondition, { message: 'Укажите состояние книги' }),
    defects: z.string().default(''),
    genre: z.array(z.string()).min(1, 'Выберите хотя бы один жанр'),
    cover: z.nativeEnum(BookCover, { message: 'Выберите тип обложки' }),
    publisherHouse: z.string().default('').optional(),
    year: z.number().int().positive().optional(),
    series: z.string().default('').optional(),
    description: z.string().default('').optional(),
    obtainingMethod: z.string().default('').optional(),
});


export const bookController = {
    async getCatalog(req: Request, res: Response) {
        try {
            let userId: number | undefined;
            const authHeader = req.headers.authorization;
            if (authHeader) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded: any = verifyToken(token);
                    userId = decoded.id;
                } catch {}
            }

            const parsed = catalogFilterSchema.parse(req.body);

            const filter = {
                city_id: parsed.cityId,
                place: parsed.place?.map(p => p as Place),
                exchangeMethod: parsed.exchangeMethod?.map(m => m as ExchangeMethod),
                condition: parsed.condition?.map(c => c as BookCondition),
                exchange: parsed.exchange?.map(e => e as ExchangeType),
                page: parsed.page,
                myBook: parsed.myBook,
                isFavorite: parsed.favorite,
                userId: userId,
                search: parsed.search,
            };

            const result = await bookService.getCatalog(filter, userId);
            res.json(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getBookById(req: Request, res: Response) {
        try {
            const bookId = parseInt(req.params.id);
            if (isNaN(bookId)) {
                return res.status(400).json({ message: 'Invalid book id' });
            }

            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            let userId: number | undefined;
            if (token) {
                const decoded = verifyToken(token) as any;
                userId = decoded.id;
            }

            const book = await bookService.getBookInfo(bookId, userId);
            res.json(book);
        } catch(error: any) {
            if (error.message === 'Book not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    },


    async addBookToFavorites(req: Request, res: Response){
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const bookId = parseInt(req.params.id);
            if (!bookId) {
                return  res.status(400).json({ message: 'Invalid book id' });
            }

            const result = await bookService.addFavBook(userId, bookId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },


    async addNewBook(req: Request, res: Response) {
        try{
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!req.body.data) {
                return res.status(400).json({message: 'Missing "data" field'});
            }

            const body = JSON.parse(req.body.data);
            const valid = bookEditSchema.parse(body);

            const files = req.files as Express.Multer.File[];
            const photos = files?.map((file, index) => ({
                isMain: index === 0,
                url: `/uploads/${file.filename}`
            }))  || null;

            const newBook = await bookService.addBook({...valid, photos}, userId);
            res.json(newBook);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ message: error.message });
        }
    },


    async updateBookInfo(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const bookId = parseInt(req.params.id);
            if (isNaN(bookId)) {
                return res.status(400).json({ message: 'Invalid book id' });
            } 

            if (!req.body.data) {
                return res.status(400).json({message: 'Missing "data" field'});
            }

            const body = JSON.parse(req.body.data);
            const valid = bookEditSchema.parse(body);

            const files = req.files as Express.Multer.File[];
            const photos = files.map((file, index) => ({
                isMain: index === 0,
                url: `/uploads/${file.filename}`
            }))


            const editBook = await bookService.updateBook(userId, bookId, {...valid, photos});
            res.json(editBook);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            if (error.message === 'Book not found') {
                return res.status(404).json({ message: error.message });
            } 
            if (error.message === 'Forbidden') {
                return res.status(403).json({ message: 'You can only edit your own books' });
            }
            res.status(500).json({ message: error.message });
        }
        
    },


    async deleteBook(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const bookId = parseInt(req.params.id);
            if (isNaN(bookId)) {
                return res.status(400).json({ message: 'Invalid book id' });
            } 

            const result = await bookService.deleteBook(userId, bookId);
            res.json(result);
        }  catch (error: any) {
            if (error.message === 'Book not found') {
                return res.status(404).json({ message: error.message });
            } 
            if (error.message === 'Forbidden') { 
                return res.status(403).json({ message: 'You can only delete your own books' });
            }
            res.status(500).json({ message: error.message });
        }

    },

    async removeBookFromFavorites(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const bookId = parseInt(req.params.id);

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });
            
            if (isNaN(bookId)) return res.status(400).json({ message: 'Invalid book id' });
            
            const result = await bookService.removeFavBook(userId, bookId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
};