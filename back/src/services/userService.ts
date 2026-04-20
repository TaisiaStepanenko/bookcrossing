import { hashPassword, comparePassword} from "../utils/bcrypt";
import { userRepository } from '../repositories/userRepository';
import { setToken } from '../utils/jwt';
import { cityRepository } from "../repositories/cityRepository";


export const registerUser = async(name: string, email: string, password: string, cityId: number, birthday_date: string, description?: string | null): Promise<{token: string, cityId: number, name: string, notificationNumber: number}> => {
    const isExist = await userRepository.findUserByEmail(email);
    if (isExist) {
        throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await userRepository.createUser({
        name,
        email,
        password: hashedPassword,
        city_id: cityId,
        birthday_date,
        description
    });

    const token = setToken(newUser.user_id, email);
    const notificationNumber = 0;

    return { token, cityId: newUser.city_id, name: newUser.name, notificationNumber};
}

export const loginUser = async(email: string, password: string): Promise<{token: string, cityId: number, name: string, notificationNumber: number}> => {
    const isExist = await userRepository.findUserByEmail(email);
    if (!isExist) {
        throw new Error('User is not registered or email is wrong');
    }

    const isTheSame = await comparePassword(password, isExist.password);

    if (!isTheSame) {
        throw new Error('Invalid password');
    }

    const token = setToken(isExist.user_id, email);

    const notificationNumber = isExist.notification_number;

    return { token, cityId: isExist.city_id, name: isExist.name, notificationNumber};

}

export const getUserInfo = async (user_id: number): Promise<{cityId: number, name: string, notificationNumber: number}> => {
    const isExist = await userRepository.findUserByID(user_id);
    if (!isExist) {
        throw new Error('User not found');
    }

    return {  cityId: isExist.city_id, name: isExist.name, notificationNumber: isExist.notification_number}
}




export const getUserProfile = async (user_id: number) => {
    const profileInfo = await userRepository.findProfileInfo(user_id)
    if (!profileInfo) {
        throw new Error('User not found');
    }

    const {reviewNumber, completedExchanges, availableBooks} = await userRepository.getUserStats(user_id);
    const userBooks = await userRepository.getUserBooks(user_id);
    const reviews = await userRepository.getUserReviews(user_id);


    return {
        userId: profileInfo.user_id,
        name: profileInfo.name,
        email: profileInfo.email,
        phone: profileInfo.phone || '',
        cityId: profileInfo.city_id,
        birthdayDate: profileInfo.birthday_date,
        rating: profileInfo.rating ? String(profileInfo.rating) : '0',
        photo: profileInfo.photo || '',
        description: profileInfo.description || '',
        reviewNumber: reviewNumber,
        registrationDate: profileInfo.registration_date,
        completedExchanges: completedExchanges,
        availableBooks: availableBooks,
        userBooks: userBooks,
        reviews: reviews.map(r => ({
            reviewId: r.review_id,
            rating: r.rating,
            comment: r.comment,
            reviewDate: r.review_date,
            reviewerInfo: {
                userId: r.reviewerInfo.user_id,
                name: r.reviewerInfo.name,
                photo: r.reviewerInfo.photo
            }
        }))
    }
}

interface UpdateProfileBody  {
    name?: string,
    email?: string,
    phone?: string,
    city_id?: number,
    birthday_date?: string,
    photo?: string,
    description?: string
}

export const updateUserProfile = async (user_id: number, updates: UpdateProfileBody) => {
    const updatedUser = await userRepository.updateProfileInfo(user_id, updates);
    if (!updatedUser) {
        throw new Error('User not found or update failed');
    }


    return getUserProfile(user_id);
}

interface NotificationResponse {
    notificationId: number;
    userId: number;
    userName: string;
    transferId: number;
    messageType: string;
    isRead: boolean;
    createdAt: string;
}

export const getUserNotifications = async (user_id: number): Promise<NotificationResponse[]> => {
    const notifications = await userRepository.getNotifications(user_id);

    return notifications.map(n => ({
        notificationId: n.notification_id,
        userId: n.user_id,
        userName: n.user_name,
        transferId: n.transfer_id,
        messageType: n.message_type,
        isRead: n.is_read,
        createdAt: n.created_at
    }));
}