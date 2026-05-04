import { Request, Response } from "express";
import { getUserInfo, getUserProfile, updateUserProfile, getUserNotifications} from '../services/userService'
import { z } from 'zod';
import { error } from "console";
import { verifyToken } from "../utils/jwt";
import { userRepository } from "../repositories/userRepository";
import { deletePhotoFromDish } from "../utils/fs";

const updateProfileSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    cityId: z.number().int().positive().optional(),
    birthdayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    photo: z.string().optional(),
    description: z.string().optional()
})


export const userController = {

    async getInfo(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const info = await getUserInfo(userId);
            res.json(info);
        } catch (error: any) {
            res.status(404). json({message: error.message});
        }
    },


    async getProfile(req: Request, res: Response) {
        try {
            let currentUserId: number | undefined;
            const authHeader = req.headers.authorization;
            if (authHeader) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded = verifyToken(token) as any;
                    currentUserId = decoded.id;
                } catch {}
            }

            const targerId = req.params.id ? parseInt(req.params.id) : currentUserId;
            if (!targerId) {
                return res.status(400).json({ message: 'User ID required when not authenticated' });
            }
            const profile = await getUserProfile(targerId);
            res.json(profile);
        } catch (error: any) {
            res.status(404).json({message: error.message});
        }
    },

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const validateInfo = updateProfileSchema.parse(req.body);
            
            const updates = {
                name: validateInfo.name,
                email: validateInfo.email,
                phone: validateInfo.phone,
                city_id: validateInfo.cityId,
                birthday_date: validateInfo.birthdayDate,
                photo: validateInfo.photo,
                description: validateInfo.description
            };

            if (req.file) {
                const user = await userRepository.findProfileInfo(userId);
                if (user?.photo) {
                    deletePhotoFromDish(user.photo);
                }
                updates.photo = `/uploads/${req.file.filename}`;
            }

            

            const update = await updateUserProfile(userId, updates);
            res.json(update);
        } catch (error: any) {
            res.status(400).json({errors: error.errors});
        }
    },

    async getNotifications(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const notifications = await getUserNotifications(userId);
            res.json(notifications);
        } catch (error: any) {
            res.status(404).json({message: error.message});
        }

    }
}