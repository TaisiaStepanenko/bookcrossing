import { where } from 'sequelize';
import {MessageType} from '../constants/enums'
import { Notification, User, Transfer, Book } from '../models';

export const notificationRepository = {

    async createNotification( data: {
        user_id: number;
        target_user_id: number;
        transfer_id: number;
        message_type: MessageType;
        status_at_creation?: string; 
    }) {
        return Notification.create(data)
    },

    async findByTargetUser(target_user_id: number): Promise<{ notifications: Notification[], total: number }> {


        const {rows, count} = await Notification.findAndCountAll({
            where: { target_user_id },
            include: [
                { model: User, as: 'initiator', attributes: ['name'] },
                { model: Transfer, as: 'transfer', attributes: ['cur_status'], required: false,
                include: [
                    { model: Book, as: 'book', attributes: ['name'] } 
                ]}
            ],
            order: [['created_at', 'DESC'], ['notification_id', 'DESC']],
        });
        
        return {notifications: rows, total: count};
    },

    async markAsRead(notification_id: number, user_id: number) {
        const [affected] = await Notification.update(
            {is_read: true},
            {where: {notification_id, target_user_id: user_id, is_read: false}}
        );
        return affected;
    },

    async delete(notification_id: number, target_user_id: number) {
        return Notification.destroy({
            where: { notification_id, target_user_id }
        });
    }

}