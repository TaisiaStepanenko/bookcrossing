import { where } from 'sequelize';
import {MessageType} from '../constants/enums'
import { Notification, User } from '../models';

export const notificationRepository = {

    async createNotificstion( data: {
        user_id: number;
        target_user_id: number;
        transfer_id: number;
        message_type: MessageType;
    }) {
        return Notification.create(data)
    },

    async findByTargetUser(target_user_id: number) {
        return Notification.findAll({
            where: { target_user_id },
            include: [
                { model: User, as: 'initiator', attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    },

    async markAsRead(notification_id: number, target_user_id: number) {
        const [affected] = await Notification.update(
            {is_read: true},
            {where: { notification_id, target_user_id }}
        )
        return affected;
    },

    async markAllAsRead(target_user_id: number) {
        const [affected] = await Notification.update(
            { is_read: true },
            { where: { target_user_id, is_read: false } }
        );
        return affected;
    },

    async delete(notification_id: number, target_user_id: number) {
        return Notification.destroy({
            where: { notification_id, target_user_id }
        });
    }

}