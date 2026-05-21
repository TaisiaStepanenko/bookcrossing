import { Request, Response } from "express";
import {z} from 'zod';
import { ExchangeType, OfferType } from "../constants/enums";
import { exchangeService } from "../services/exchangeService";
import { Book } from "../models";

const createExchangeSchema = z.object({
    targetBookId: z.number().int().positive(),
    offeredBookIds: z.array(z.number().int().positive()).min(1).max(3),
    offerType: z.nativeEnum(OfferType),
})

export const exchangeController = {


    async addExchange(req: Request, res: Response) {
        try {
            const initiatorId = (req as any).user?.id;
            if (!initiatorId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { targetBookId, offeredBookIds, offerType } = req.body;

            const targetBook = await Book.findByPk(targetBookId);
            if (!targetBook) {
                return res.status(404).json({ message: 'Book not found' });
            }

            if (targetBook.exchangeType === ExchangeType.FREE) {
                const exchange = await exchangeService.addFreeExchange(targetBookId, initiatorId);
                return res.status(200).json(exchange);
            }

            const parsedInfo = createExchangeSchema.parse(req.body);

            const exchange = await exchangeService.addNewExchange(
                parsedInfo.targetBookId,
                initiatorId, 
                parsedInfo.offerType, 
                parsedInfo.offeredBookIds
            );
            res.status(200).json(exchange);

        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            const status =
                error.message === 'Book not found' ? 404 :
                error.message === 'Cannot exchange your own book' ? 400 :
                error.message === 'Target book is not available' ? 400 :
                error.message === 'One or more offered books not found' ? 400 :
                error.message === 'Offered books must belong to you' ? 400 :
                500;
            res.status(status).json({ message: error.message });
            
        }
    },


    async getIncomingExchanges(req: Request, res: Response) {
        try {
        const ownerId = (req as any).user?.id;

        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const incomingExchanges = await exchangeService.getIncomingExchanges(ownerId)
        res.status(200).json(incomingExchanges);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: error.message || 'Internal server error' });
        }
    },


    async cancelAllBookExchanges(req: Request, res: Response) {
        try{
            const ownerId = (req as any).user?.id;

            if (!ownerId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const bookId = parseInt(req.params.bookId);
            if (isNaN(bookId)) {
                return res.status(400).json({ message: 'Invalid book id' })
            }

            const result = await exchangeService.cancelAllBookExchanges(bookId, ownerId);
            res.json(result);
        } catch (error: any) {
            if (error.message === 'No pending exchanges found for this book') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }

    },

    async getAllExchanges(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const type = req.params.type;
            if ( type !== 'incoming' && type !== 'outcoming' && type !== 'running' && type !== 'ended') {
                return res.status(400).json({ message: 'Invalid type id' })
            }

            let bookId: number | undefined;
            if (req.params.id) {
                bookId = parseInt(req.params.id);
                if (isNaN(bookId)) return res.status(400).json({ message: 'Invalid book id' });
            }
                

            const result = await exchangeService.getExchanges( userId, type, bookId);
            res.json(result);
        } catch (error: any) {
            if (error.message === 'Exchange not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    },


    async changeStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const exchangeId = parseInt(req.params.id);
            if (isNaN(exchangeId)) {
                return res.status(400).json({ message: 'Invalid exchange id' });
            }

            const {activity, keptBookIds, acceptOffer} = req.body;
            if (activity != 'accept' && activity != 'cancel') {
                return res.status(400).json({ message: 'Invalid activity' });
            }

            const result = await exchangeService.changeExchangeStatus(exchangeId, userId, activity, keptBookIds);
            res.json(result);
        } catch (error: any) {
            if (error.message === 'Exchange not found or already processed') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }

    }
}