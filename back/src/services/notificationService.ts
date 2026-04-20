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
    }) {
        const notifications = await notificationRepository.createNotificstion(data);
        await userRepository.incrementNotifications(data.target_user_id);
        return notifications;
    },

    async markAsRead(target_user_id: number) {
        await notificationRepository.markAllAsRead(target_user_id);
        await userRepository.resetNotifications(target_user_id);
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