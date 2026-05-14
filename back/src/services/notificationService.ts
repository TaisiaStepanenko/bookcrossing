import { create } from "domain";
import {MessageType} from '../constants/enums'
import { notificationRepository } from "../repositories/notificationRepository";
import { userRepository } from "../repositories/userRepository";

export const notificationService = {


    async createNotification(data: {
        user_id: number;
        target_user_id: number;
        transfer_id: number;
        message_type: MessageType;
        status_at_creation?: string;
    }) {
        const notifications = await notificationRepository.createNotification(data);
        await userRepository.incrementNotifications(data.target_user_id);
        return notifications;
    },

    
    async markOneAsRead(notificationId: number, userId: number) {
        const affected = await notificationRepository.markAsRead(notificationId, userId);
        if (affected === 0) {
            throw new Error('Notification not found or already read');
        }
        await userRepository.decrementNotification(userId);
        return { success: true };
    },

    async deleteNotification(notificationId: number, userId: number) {
         const deleted = await notificationRepository.delete(notificationId, userId);
        if (deleted === 0) {
            throw new Error('Notification not found');
        }
        return { success: true };
    },
} 