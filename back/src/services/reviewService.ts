import { Review, Transfer, User } from "../models";
import { updateUserProfile } from "./userService";
import { notificationService } from "./notificationService";
import { MessageType } from "../constants/enums";


export const reviewService = {

    async countRating(user_id: number) {
        const reviews = await Review.findAll({
            where: {reviewed_user_id: user_id},
            attributes: ['rating'],
            raw: true
        });

        if (reviews.length === 0) {
            await User.update({ rating: null }, { where: { user_id: user_id } });
            return;
        }
         
        const avg = reviews.reduce((sum: number, r: any) => sum + parseFloat(r.rating), 0) / reviews.length;

        await User.update({rating: avg}, {where: {user_id: user_id}});
    },


    async createReview(user_id: number, exchange_id: number, rating: number, comment?: string) {

        const exchange = await Transfer.findByPk(exchange_id);

        if (!exchange || exchange.cur_status !== 'COMPLETED_SUCCESS') {
            throw new Error('Exchange not found or not completed');
        }

        if (exchange.owner_id != user_id && exchange.initiator_id != user_id) {
            throw new Error('You are not a participant of this exchange');
        }

        const isExist = await Review.findOne({
            where: {transfer_id: exchange_id, reviewer_id: user_id},
        })
        if (isExist) {
            throw new Error('You have already reviewed this exchange');
        }

        const reviewedUserId = exchange.initiator_id === user_id ? exchange.owner_id : exchange.initiator_id;

        const review = await Review.create({
            transfer_id: exchange_id,
            reviewer_id: user_id,
            reviewed_user_id: reviewedUserId,
            rating,
            comment: comment || null
        })

        await this.countRating(user_id);

        await notificationService.createNotification({
            user_id: user_id,                      
            target_user_id: reviewedUserId,        
            transfer_id: exchange_id,
            message_type: MessageType.REVIEW
        });

        return review;
    }

}