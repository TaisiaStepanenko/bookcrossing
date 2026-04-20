
import { error } from "console";
import { BookStatus, MessageType, OfferType } from "../constants/enums"
import { Book, OfferingBook, User } from "../models";
import { Op } from "sequelize";
import { exchangeRepository } from "../repositories/exchangeRepository";
import { notificationService } from "./notificationService";
import { userRepository } from "../repositories/userRepository";
import { notificationRepository } from "../repositories/notificationRepository";


export const exchangeService = {


    async addNewExchange(book_id: number, init_user_id: number, type: OfferType, offeredBooksIds: number[]) {
        const book = await Book.findByPk(book_id);
        if (!book) {
            throw new Error ('Book not found');
        }

        if (book.owner_id === init_user_id) {
            throw new Error ('Cannot exchange your own book');
        }

        if (book.status != BookStatus.AVAILABLE) {
            throw new Error('Target book is not available');
        }

        const offeredBooks = await Book.findAll({
            where: { book_id: { [Op.in]: offeredBooksIds } }
        });

        if (offeredBooks.length != offeredBooksIds.length) {
            throw new Error ( 'Not all offered books found' )
        }

        for (const book of offeredBooks) {
            if (book.owner_id !== init_user_id) {
                throw new Error('Offered books must belong to you');
            }
            if (book.status !== 'AVAILABLE') {
                throw new Error(`Book ${book.book_id} is not available`);
            }
        }

        const exchange = await exchangeRepository.addBookExchange( book_id, init_user_id, book.owner_id, type);

        await exchangeRepository.addOfferingBooks(exchange.transfer_id, offeredBooksIds);

        await notificationService.createNotification({
            user_id: init_user_id,
            target_user_id: book.owner_id,
            transfer_id: exchange.transfer_id,
            message_type: MessageType.EXCHANGE
        })

        return exchangeRepository.findById(exchange.transfer_id);
    },

    async getIncomingExchanges(user_id: number) {
        const exchanges = await exchangeRepository.getAllIncomingExchanges(user_id);

        const groupedByBook: Record<number, {
            bookId: number,
            bookName: string,
            mainPhoto: string | null,
            initiators: any[]
        }> = {};

        for( const e of exchanges) {
            const book = e.book;
            if (!book) {
                continue;
            }

            if(!groupedByBook[book.book_id]) {
                const mainPhoto = book.photos[0]?.photo_url || null;
                groupedByBook[book.book_id] = {
                    bookId: book.book_id,
                    bookName: book.name,
                    mainPhoto: mainPhoto,
                    initiators: []
                }
            }

            const initiator = e.initiator;
            const alreadyExist = groupedByBook[book.book_id].initiators.some(i => i.id === initiator.user_id);

            if (!alreadyExist) {
                groupedByBook[book.book_id].initiators.push({
                    id: initiator.user_id,
                    name: initiator.name,
                    avatar: initiator.photo || null
                })
            }

        }

        return Object.values(groupedByBook).map(item => ({
                id: item.bookId.toString(),
                name: item.bookName,
                src: item.mainPhoto || null,
                people: item.initiators
            }))

    },

    async cancelAllBookExchanges(book_id: number, owner_id: number) {
        const exchanges = await exchangeRepository.cancelAllBookExchanges(book_id, owner_id);
        if (exchanges === 0) {
            throw new Error('No exchanges found for this book');
        }

        return { message: `Rejected ${exchanges} exchange(s)` };
    },

    async getIncomingExchangesById(book_id: number, owner_id: number) {
        const exchanges = await exchangeRepository.getAllIncomingExchangesById(book_id, owner_id);
        if (exchanges === 0) {
            throw new Error('No exchanges found');
        }
        

        return exchanges.map((ex: any) => {
            const initiator = ex.initiator;
            const targetBook = ex.book;
            const offeringBooks = ex.offeringBooks || [];

            return {
                id: ex.transfer_id.toString(),
                name: initiator?.name || '',
                avatar: initiator?.photo || null,
                bookCount: ex.offerType,
                myBook: {
                    id: targetBook.book_id.toString(),
                    name: targetBook.name || '',
                    src: targetBook.photos?.[0]?.photo_url || ''
                },
                userBooks: offeringBooks.map((oBook: any) => ({
                    id: oBook.book?.book_id?.toString() || '',
                    name: oBook.book?.name || '',
                    src: oBook.book?.photos?.[0]?.photo_url || ''
                }))

                
                
            }
        })
    },


    async cancelBookExchangeById(exchange_id: number, owner_id: number) {
        const exchange = await exchangeRepository.cancelExchangeById(exchange_id, owner_id);
        if (exchange === 0) {
            throw new Error('Exchange not found or already processed');
        }
        return {message: 'Exchange rejected successfully'};
    },


    async acceptExchange(exchange_id: number, owner_id: number) {
        const updateExchange = await exchangeRepository.acceptExchange(exchange_id, owner_id);
        if (updateExchange === 0) {
            throw new Error('Exchange not found or already processed');
        }
        console.log(updateExchange)
        
        const exchange = await exchangeRepository.findById(exchange_id);
        if (exchange) {
            await notificationRepository.createNotificstion({ 
                user_id: owner_id,
                target_user_id: exchange.initiator_id,
                transfer_id: exchange_id,
                message_type: MessageType.EXCHANGE
            });
        }

        return { message: 'Exchange accepted successfully' }; 
    }

    


}