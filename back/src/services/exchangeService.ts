
import { error } from "console";
import { BookStatus, MessageType, OfferType, TransferStatus } from "../constants/enums"
import { Book, OfferingBook, Transfer, User } from "../models";
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

        const existingExchange = await Transfer.findOne(
            {where: {book_id, initiator_id: init_user_id, 
                cur_status: {
                    [Op.notIn]: [
                        TransferStatus.CANCELLED,
                        TransferStatus.COMPLETED_SUCCESS,
                        TransferStatus.COMPLETED_PREMATURELY
                    ]
                }
            }}
        )

        if (existingExchange) {
            throw new Error('You already have an active exchange request for this book');
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
            message_type: MessageType.EXCHANGE,
            status_at_creation: exchange.cur_status
        })

        return exchangeRepository.findById(exchange.transfer_id);
    },

    async addFreeExchange(book_id: number, init_user_id: number) {
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

        const existingExchange = await Transfer.findOne(
            {where: {book_id, initiator_id: init_user_id, 
                cur_status: {
                    [Op.notIn]: [
                        TransferStatus.CANCELLED,
                        TransferStatus.COMPLETED_SUCCESS,
                        TransferStatus.COMPLETED_PREMATURELY
                    ]
                }
            }}
        )

        if (existingExchange) {
            throw new Error('You already have an active exchange request for this book');
        }

        const exchange = await exchangeRepository.addBookExchange(
            book_id,
            init_user_id,
            book.owner_id,
            OfferType.ONE
        );

        await notificationService.createNotification({
            user_id: init_user_id,
            target_user_id: book.owner_id,
            transfer_id: exchange.transfer_id,
            message_type: MessageType.EXCHANGE,
            status_at_creation: exchange.cur_status
        });

        return exchangeRepository.findById(exchange.transfer_id);
    },

    async getIncomingExchanges(user_id: number) {
        const exchanges = await exchangeRepository.getAllIncomingExchanges(user_id);
        

        const groupedByBook: Record<number, {
            bookId: number,
            bookName: string,
            mainPhoto: string | null,
            exchangeType: string,
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
                    exchangeType: book.exchangeType,
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
                exchangeType: item.exchangeType,
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

    async getExchanges(user_id: number, type: 'incoming' | 'outcoming' | 'running' | 'ended', book_id?: number) {
        const exchanges = await exchangeRepository.getExchanges(user_id, type, book_id);
        
        const result = await Promise.all(exchanges.map(async (ex: any) => {
            const initiator = ex.initiator;
            const owner = ex.owner;
            const targetBook = ex.book;
            const offeringBooks = ex.offeringBooks || [];
            const hasReview = await exchangeRepository.hasReview(ex.transfer_id, user_id);
            
            return {
                id: ex.transfer_id,
                name: user_id === owner.user_id ? initiator.name : owner.name,
                avatar: user_id === owner.user_id ? initiator.photo : owner.photo || null,
                userType: user_id === owner.user_id ? 'OWNER' : 'INITIATOR',
                bookCount: ex.offerType,
                ownerBook: {
                    id: targetBook.book_id,
                    name: targetBook.name || '',
                    src: targetBook.photos?.[0]?.photo_url || ''
                },
                initiatorBooks: offeringBooks.map((oBook: any) => ({
                    id: oBook.book?.book_id?.toString() || '',
                    name: oBook.book?.name || '',
                    src: oBook.book?.photos?.[0]?.photo_url || ''
                })),
                type: ex.cur_status,
                currentStatusInitiator: ex.current_status_initiator,
                currentStatusOwner: ex.current_status_owner,
                exchangeType: targetBook?.exchangeType || null,
                hasReview
            };
        }));
        
        return result;
    },



    async changeExchangeStatus(exchange_id: number, user_id: number, activity: 'accept' | 'cancel', keptBookIds?: number[], acceptOffer?: number) {
        const success = await exchangeRepository.changeStatus(exchange_id, user_id, activity, keptBookIds);
        if (!success) {
            throw new Error('Exchange not found');
        }
        
        
        const exchange = await exchangeRepository.findById(exchange_id);
        if (exchange) {
            const otherUserId = exchange.owner_id === user_id ? exchange.initiator_id : exchange.owner_id;
            await notificationService.createNotification({
                user_id: user_id,
                target_user_id: otherUserId,
                transfer_id: exchange_id,
                message_type: MessageType.EXCHANGE,
                status_at_creation: exchange.cur_status
            });
            if (exchange.cur_status === 'COMPLETED_SUCCESS' || exchange.cur_status === 'COMPLETED_PREMATURELY' ) {
                await notificationService.createNotification({
                user_id: otherUserId,
                target_user_id: user_id,
                transfer_id: exchange_id,
                message_type: MessageType.EXCHANGE,
                status_at_creation: exchange.cur_status
            });
            }
        }

        return { message: 'Exchange`s status update successfully' }; 
    }

    


}