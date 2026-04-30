import { Op, where } from 'sequelize';
import Book from '../models/Book';
import BookPhoto from '../models/BookPhoto';
import User from '../models/User';
import City from '../models/City';
import Favorite from '../models/Favorite';
import Review from '../models/Review';
import {BookCondition, ExchangeMethod, ExchangeType, Place, BookCover} from '../constants/enums'
import {cityRepository} from './cityRepository';


export interface BookFilter {
    city_id?: number;
    place?: Place[];
    exchangeMethod?: ExchangeMethod[];
    condition?: BookCondition[];
    exchange?: ExchangeType[];
    page: number;
    myBook?: boolean;
    isFavorite?: boolean;
}




export interface BookCatalogItem {
    id: number;
    name: string;
    author: string;
    place: string;
    src: string | null;
    exchangeType: ExchangeType;
    exchangeMethod: ExchangeMethod;
    isFavorite: boolean;
}

export interface BookEdit {
    name:string;
    photos?: {isMain: boolean, url: string}[];
    deletedPhotos?: string[];
    exchangeType: ExchangeType;
    exchangeMethod: ExchangeMethod;
    author: string;
    condition: BookCondition;
    defects: string;
    genre: string;
    cover: BookCover;
    publisherHouse?: string | null;
    year?: number | 0;
    series?: string | null;
    description?: string | null;
    obtainingMethod?: string | null;
}





export const BookRepository = {


    async findWithFilter(filter: BookFilter, user_id?: number): Promise<{ items: BookCatalogItem[]; page: number, totalPages: number }> {
        const limit = 12;
        const where: any = {};
        const include: any[] = [];

        if (filter.place && filter.place.length > 0) {
            if (!filter.place.includes(Place.RUSSIA)) {
                if (!filter.city_id) {
                    throw new Error('cityId required for MY_PLACE or NEAR filter');
                }

                if (filter.place.includes(Place.MY_PLACE) && filter.place.includes(Place.NEAR)) {
                    const cityIds = await cityRepository.getCitiesByRegion(filter.city_id);
                    where['$owner.city_id$'] = { [Op.in]: cityIds };
                } else if (filter.place.includes(Place.MY_PLACE)) {
                    where['$owner.city_id$'] = filter.city_id;
                } else if (filter.place.includes(Place.NEAR)) {
                    const cityIds = await cityRepository.getCitiesByRegion(filter.city_id);
                    where['$owner.city_id$'] = { [Op.in]: cityIds };
                }
            }
        } else {
            if (filter.city_id) {
                where['$owner.city_id$'] = filter.city_id;
            }
        }

        if (filter.exchangeMethod && filter.exchangeMethod.length > 0) {
            where.exchangeMethod = { [Op.in]: filter.exchangeMethod };
        }

        if (filter.condition && filter.condition.length > 0) {
            where.condition = { [Op.in]: filter.condition };
        }


        if (filter.exchange && filter.exchange.length > 0) {
            where.exchangeType = { [Op.in]: filter.exchange };
        }

        where.status = 'AVAILABLE';

        if (filter.myBook && user_id) {
            where.owner_id = user_id;
        }

        if (filter.isFavorite && user_id) {
            include.push({
                model: Favorite,
                as: 'favorites',
                attributes: [],
                where: { user_id: user_id },
                required: true
            });
        } else if (user_id) {
            include.push({
                model: Favorite,
                as: 'favorites',
                attributes: ['user_id'],
                where: { user_id: user_id },
                required: false
            });
        }

        include.push(
            {
                model: User,
                as: 'owner',
                attributes: ['user_id', 'name', 'city_id'],
                include: [
                    {
                        model: City,
                        as: 'city',
                        attributes: ['name']
                    }
                ],
                required: true
            },
            {
                model: BookPhoto,
                as: 'photos',
                attributes: ['photo_url'],
                where: { is_main: true },
                limit: 1,
                required: false
            }
        );

        const offset = (filter.page) * limit;

        const { rows, count } = await Book.findAndCountAll({
            where, include,
            attributes: ['book_id', 'name', 'author', 'exchangeType', 'exchangeMethod'],
            order: [['registration_date', 'DESC']],
            limit,
            offset,
            distinct: true,
            subQuery: false
        });

        const items: BookCatalogItem[] = rows.map((book: any) => {
            const owner = book.owner;
            const mainPhoto = book.photos?.[0];

            let isFavorite = false;
            console.log(book)
            if (user_id && book.favorites) {
                isFavorite = Array.isArray(book.favorites)
                    ? book.favorites.some((f: any) => f.user_id === user_id)
                    : false;
            }

            return {
                id: book.book_id,
                name: book.name,
                author: book.author,
                place: owner?.city?.name || 'Не указан',
                src: mainPhoto?.photo_url || null,
                exchangeType: book.exchangeType as ExchangeType,
                exchangeMethod: book.exchangeMethod as ExchangeMethod,
                isFavorite: isFavorite
            };
        });
        return {
            items,
            page: filter.page,
            totalPages: Math.ceil(count / limit),

        };

    },

    async getBookById(book_id: number, user_id?: number): Promise<any> {
        const include: any[] = [
            {
                model: BookPhoto,
                as: 'photos',
                attributes: ['photo_url', 'is_main', 'sort_order'],
                order: [['sort_order', 'ASC']]
            },
            {
                model: User,
                as: 'owner',
                attributes: ['user_id', 'name', 'city_id', 'rating', 'photo', 'notification_number', 'registration_date'],
                include: [
                    {
                        model: City,
                        as: 'city',
                        attributes: ['name']
                    }
                ],
                required: true
            }

        ];

        if (user_id) {
            include.push({
                model: Favorite,
                as: 'favorites',
                attributes: ['user_id'],
                where: { user_id: user_id },
                required: false
            });
        }

        const book = await Book.findByPk(book_id, { include });

        if (!book) return null;

        const photos = book.get('photos') as BookPhoto[] || [];



        let fav;
        if (user_id) {
            fav = await this.isFavorite({ user_id, book_id });
        }

        const owner = await User.findByPk(book.owner_id);
        const userCity = await City.findByPk(owner?.city_id);
        const feedbacksNumber = await Review.count({
            where: { reviewed_user_id: owner?.user_id }
        });

        const otherBooks = await this.findOtherBooksByOwner(owner!.user_id, book_id)

        
        const isMyBook = user_id && user_id === owner?.user_id
console.log(user_id, owner?.user_id)
        return {
            bookId: book.book_id,
            photos: (photos).map((p: any) => ({
                isMain: p.is_main,
                url: p.photo_url
            })),
            exchangeType: book.exchangeType,
            exchangeMethod: book.exchangeMethod,
            name: book.name,
            author: book.author,
            condition: book.condition,
            defects: book.defects || '',
            genre: book.genre,
            cover: book.cover,
            isFavorite: user_id ? fav : false,
            publisherHouse: book.publishing_house || '',
            year: book.year,
            series: book.series || '',
            description: book.description || '',
            registrationDate: book.registration_date,
            obtainingMethod: book.obtaining_methods,
            otherBooks: otherBooks,
            isMy: isMyBook,
            userInfo: {
                shortName: owner?.name.split(' ')[0] || owner?.name,
                city: userCity?.name,
                name: owner?.name,
                avatar: owner?.photo,
                userId: owner?.user_id,
                raiting: owner?.rating || 0,
                reviewNumber: feedbacksNumber,
                registrationDate: owner?.registration_date
            }
        };
    },

    async findOtherBooksByOwner(
        ownerId: number,
        excludeBookId: number,
        limit: number = 4
    ): Promise<BookCatalogItem[]> {
        const books = await Book.findAll({
            where: {
                owner_id: ownerId,
                book_id: { [Op.ne]: excludeBookId },
                status: 'AVAILABLE'
            },
            include: [
                {
                    model: BookPhoto,
                    as: 'photos',
                    attributes: ['photo_url'],
                    where: { is_main: true },
                    required: false
                },
                {
                    model: User,
                    as: 'owner',
                    attributes: ['user_id', 'name'],
                    include: [{ model: City, as: 'city', attributes: ['name'] }]
                }
            ],
            limit,
            order: [['registration_date', 'DESC']]
        });

        return books.map((book: any) => ({
            id: book.book_id,
            name: book.name,
            author: book.author,
            place: book.owner?.city?.name || 'Не указан',
            src: book.photos?.[0]?.photo_url || null,
            exchangeType: book.exchangeType as ExchangeType,
            exchangeMethod: book.exchangeMethod as ExchangeMethod,
            isFavorite: false
        }));
    },

    async addBookToFavorites(data: {
        user_id: number,
        book_id: number
    }): Promise<boolean> {
        try {
            await Favorite.create(data);
            return true;
        } catch {
            return false;
        }
    },

    async deleteBookFromFavorites(data: {
        user_id: number,
        book_id: number
    }): Promise<number> {
        return Favorite.destroy({
            where: { user_id: data.user_id, book_id: data.book_id }
        })
    },

    async isFavorite(data: {
        user_id: number,
        book_id: number
    }): Promise<boolean> {

        const favorite = await Favorite.findOne({
            where: { user_id: data.user_id, book_id: data.book_id }
        });

        if (favorite) {
            return true;
        }
        return false;
    },


    async addBookPhoto(book_id:number, photos: {isMain: boolean, url: string}[]) {
        const bookPhotos = photos.map((p, index) => ({
            book_id: book_id,
            photo_url: p.url,
            is_main: p.isMain,
            sort_order: index
        }))
        return BookPhoto.bulkCreate(bookPhotos);
    },

    async addNewBook(data: BookEdit, user_id: number) {
        return await Book.create({
            name: data.name,
            author: data.author,
            genre: data.genre,
            cover: data.cover,
            publishing_house: data.publisherHouse,
            year: data.year,
            series: data.series,
            description: data.description,
            condition: data.condition,
            defects: data.defects,
            exchangeMethod: data.exchangeMethod,
            exchangeType: data.exchangeType,
            obtaining_methods: data.obtainingMethod,
            owner_id: user_id,
        });
    },

    async updateBookInfo(book_id: number, data: BookEdit) {
        return await Book.update(
            {
            name: data.name,
            author: data.author,
            genre: data.genre,
            cover: data.cover,
            publishing_house: data.publisherHouse,
            year: data.year,
            series: data.series,
            description: data.description,
            condition: data.condition,
            defects: data.defects,
            exchangeMethod: data.exchangeMethod,
            exchangeType: data.exchangeType,
            obtaining_methods: data.obtainingMethod,
            
            }, {
            where: {book_id: book_id},
            returning: true,

        });
    },

   async deleteBook(book_id: number): Promise<number> {
    return Book.destroy({ where: { book_id } });
}
   



}