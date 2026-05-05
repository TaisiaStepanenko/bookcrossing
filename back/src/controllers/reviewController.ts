import { Request, Response } from "express";
import { z } from "zod";
import { reviewService } from "../services/reviewService";


const createReviewSchema = z.object({
    transferId: z.number().int().positive(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
})

export const reviewController = {
    async createReview(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });


            const parsed = createReviewSchema.parse(req.body);

            const result = await reviewService.createReview(userId, parsed.transferId, parsed.rating, parsed.comment);

            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.issues });
            }
            const status =
                error.message === 'Exchange not found or not completed' ? 400 :
                error.message === 'You are not a participant of this exchange' ? 403 :
                error.message === 'You have already reviewed this exchange' ? 409 :
                500;
            res.status(status).json({ message: error.message });
        }
        
    }
}