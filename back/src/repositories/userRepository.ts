import { User, City, Notification, Review, Transfer, Book, BookPhoto } from '../models';
import {ExchangeType, ExchangeMethod, TransferStatus} from '../constants/enums';
import {BookCatalogItem} from './bookRepository';
import {notificationRepository} from './notificationRepository';
import {STATUS_TABS} from '../constants/enums';
import { Op } from 'sequelize';



export const userRepository = {

    async createUser( data: {
        name: string,
        email: string,
        password: string,
        city_id: number,
        birthday_date: string,
        description?: string | null
    }): Promise<User> {
        return User.create(data);
    },

    async findUserByEmail(email: string): Promise<User | null> {
        return User.findOne({where: {email}});
    },

    async findUserByID(user_id: number): Promise<User | null> {
        return User.findByPk(user_id, {
            attributes: ['user_id', 'name', 'city_id', 'notification_number'],
            include: [
                {
                    model: City,
                    as: 'city', 
                    attributes: ['name']
                }
            ]
        });
    },

    async findProfileInfo(user_id: number): Promise<User | null> {
        return User.findByPk(user_id, {
            attributes: ['user_id', 'name', 'email', 'phone', 'city_id', 'birthday_date', 'rating', 'photo', 'description', 'notification_number', 'registration_date'],
            include: [
                {
                    model: City,
                    as: 'city', 
                    attributes: ['city_id', 'name']
                }
            ]
        });
    },

    async getUserStats(user_id: number) {
        const reviewNumber = await Review.count({where: {reviewed_user_id: user_id}});
        const completedExchanges = await Transfer.count({
        where: {
            cur_status: TransferStatus.COMPLETED_SUCCESS,
            [Op.or]: [
                { owner_id: user_id },
                { initiator_id: user_id }
            ]
        }});
        const availableBooks = await Book.count({where: {owner_id: user_id, status: 'AVAILABLE'}});

        return {reviewNumber, completedExchanges, availableBooks};
    },

    async getUserBooks(user_id: number) {
        const books = await Book.findAll({
            where: {owner_id: user_id, status: 'AVAILABLE'},
            include: [
                { model: BookPhoto, as: 'photos', attributes: ['photo_url'], where: {is_main: true}, required: false},
                {model: User, as: 'owner', attributes: ['user_id', 'name'], include: [{ model: City, as: 'city', attributes: ['city_id', 'name'],}]}
            ],
            order: [['registration_date', 'DESC']]
        })
        return books.map((book: any) => ({
            id: book.book_id,
            name: book.name,
            author: book.author,
            place: book.owner?.city?.name || 'Не указан',
            src: book.photos?.[0]?.photo_url || null,
            exchangeType: book.exchangeType as ExchangeType,
            exchangeMethod: book.exchangeMethod as ExchangeMethod,
            isFavorite: false, // для списка книг владельца без текущего пользователя
        }));
    },

    async getUserReviews(user_id: number) {

        const reviews = await Review.findAll({
            where: {reviewed_user_id: user_id},
            attributes: ['review_id', 'rating', 'comment', 'review_date'],
            include: [
                {model: User, as: 'reviewer', attributes: ['user_id', 'name', 'photo']} 
            ],
            order: [['review_date', 'DESC']]
        });

        return reviews.map((review: any) => ({
            review_id: review.review_id,
            rating: review.rating,
            comment: review.comment,
            review_date: review.review_date,
            reviewerInfo: {
                user_id: review.reviewer.user_id,
                name: review.reviewer.name,
                photo: review.reviewer.photo || '',
            }
        }))
    },

    async updateProfileInfo(user_id: number, data: {
        name?: string,
        email?: string,
        phone?: string,
        city_id?: number,
        birthday_date?: string,
        photo?: string,
        description?: string
    }): Promise<[number, User[]]> {
        return User.update(data, {where: {user_id: user_id}, returning: true});

    },

    async getNotifications(user_id: number, page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;
        const {notifications, total} = await notificationRepository.findByTargetUser(user_id, limit, offset);
        

        return notifications.map((n: any) => ({
            notificationId: n.notification_id,
            userId: n.user_id,                  
            userName: n.initiator?.name || '',
            transferId: n.transfer_id,
            messageType: n.message_type,
            isRead: n.is_read,
            createdAt: n.created_at,
            curStutus: STATUS_TABS[n.transfer.cur_status as TransferStatus]
        }))
    },

    async incrementNotifications(user_id: number): Promise<void> {
        await User.increment(
            'notification_number', {where: {user_id}}
        )
    },

    async resetNotifications(user_id: number): Promise<void> {
        await User.update(
            { notification_number: 0 },
            { where: { user_id } }
        );
    }
 
}