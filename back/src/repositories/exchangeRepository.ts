import { OfferType, TransferStatus, BookStatus, MessageType } from "../constants/enums";
import { Book, BookPhoto, OfferingBook, Review, Transfer, User } from "../models";
import { Op, where } from "sequelize";
import { notificationService } from "../services/notificationService";


export const exchangeRepository = {


    async addBookExchange(book_id: number, init_user_id: number, owner_id: number, type: OfferType) {
        return Transfer.create({   
            initiator_id: init_user_id,
            owner_id: owner_id,
            book_id,
            offerType: type
        })
    },


    async addOfferingBooks(transfer_id: number, book_ids: number[]) {
        const books = book_ids.map((book_id, index) => ({
            transfer_id: transfer_id,
            book_id: book_id,
            sort_order: index,
        }))
        return OfferingBook.bulkCreate(books);
    },

    async addFreeExchange(book_id: number, init_user_id: number) {
        const target_book = await Book.findByPk(book_id);

        if (!target_book) throw new Error('Book not found');
        if (target_book.owner_id === init_user_id) throw new Error('Cannot request your own book');
        if (target_book.status !== BookStatus.AVAILABLE) throw new Error('Target book is not available');

        const exchange = await exchangeRepository.addBookExchange(
            book_id,
            init_user_id,
            target_book.owner_id,
            OfferType.ONE
        )

        return exchangeRepository.findById(exchange.transfer_id);
    },

    

    async findById(transferId: number) {
        return Transfer.findByPk(transferId, {
        include: ['initiator', 'owner', 'book', 'offeringBooks'],
        });
    },

    async getAllIncomingExchanges(user_id: number): Promise<any> {
        return Transfer.findAll({
            where: {
                owner_id: user_id,
                current_status_owner: {
                    [Op.in]: [TransferStatus.WAITING_RESPONSE, TransferStatus.WAITING_CONFIRMATION]
                }
            },
            include: [
                {model: User, as: 'initiator', attributes: ['user_id', 'name', 'photo']},
                {model: Book, as: 'book', attributes: ['book_id', 'name', 'exchangeType'], include: [
                    {model: BookPhoto, as: 'photos', attributes: ['photo_url'], required: false}
                ]}
            ],
            order: [['created_at', 'DESC']],
        });
    },

    async cancelAllBookExchanges(book_id: number, owner_id: number): Promise<number> {

        const pendingTransfers = await Transfer.findAll({
            where: {
                book_id: book_id,
                owner_id: owner_id,
                current_status_owner: TransferStatus.WAITING_RESPONSE
            },
            include: [{ model: OfferingBook, as: 'offeringBooks' }]
        });

        if (pendingTransfers.length === 0) return 0;

        const [affectedCount] = await Transfer.update(
            {current_status_owner: TransferStatus.CANCELLED, current_status_initiator: TransferStatus.CANCELLED, cur_status: TransferStatus.CANCELLED},
            { where: {book_id: book_id, owner_id: owner_id, current_status_owner: TransferStatus.WAITING_RESPONSE}},
        )

        await Book.update(
            { status: BookStatus.AVAILABLE },
            { where: { book_id: book_id } }
        );

        const offeredBookIds: number[] = [];
        for (const transfer of pendingTransfers) {
            const offeredBooks = await OfferingBook.findAll({
                where: {transfer_id: transfer.transfer_id}
            });
            if (offeredBooks.length !== 0) {
                for (const ob of offeredBooks) {
                    offeredBookIds.push(ob.book_id);
                }
            }  
        }
        if (offeredBookIds.length > 0) {
            await Book.update(
                { status: BookStatus.AVAILABLE },
                { where: { book_id: { [Op.in]: offeredBookIds } } }
            );
        }

        return affectedCount;
    },

    
    
    
    async changeStatus(exchange_id: number, user_id: number, activity: 'accept' | 'cancel', keptBookIds?: number[]): Promise<boolean> {
        const exchange = await Transfer.findByPk(exchange_id);
        if (!exchange) return false;

        if (activity === 'accept') {
            if (exchange.cur_status === TransferStatus.WAITING_RESPONSE) {
                await Transfer.update(
                    { current_status_owner: TransferStatus.WAITING_CONFIRMATION, current_status_initiator: TransferStatus.WAITING_CONFIRMATION, cur_status: TransferStatus.WAITING_CONFIRMATION },
                    { where: { transfer_id: exchange_id } }
                );
                if (keptBookIds !== undefined) {
                    await this.deleteOfferingBooks(exchange_id, keptBookIds);
                }
                await this.deleteOtherOffers(exchange.book_id, exchange_id);
                
                await Book.update(
                    { status: BookStatus.IN_EXCHANGE },
                    { where: { book_id: exchange.book_id } }
                );

                const offeringBooks = await OfferingBook.findAll({
                    where: { transfer_id: exchange_id },
                    attributes: ['book_id']
                });
                const offeredBookIds = offeringBooks.map(ob => ob.book_id);
                if (offeredBookIds.length > 0) {
                    await Book.update(
                        { status: BookStatus.IN_EXCHANGE },
                        { where: { book_id: { [Op.in]: offeredBookIds } } }
                    );
                }
            } 
            else if (exchange.cur_status === TransferStatus.WAITING_CONFIRMATION) {
                await Transfer.update(
                    { current_status_owner: TransferStatus.WAITING_TO_BE_SENT, current_status_initiator: TransferStatus.WAITING_TO_BE_SENT, cur_status: TransferStatus.WAITING_TO_BE_SENT },
                    { where: { transfer_id: exchange_id } }
                );
            } 
            else if (exchange.cur_status === TransferStatus.WAITING_TO_BE_SENT) {
                if (exchange.owner_id === user_id) {
                    await Transfer.update(
                        { current_status_owner: TransferStatus.SENT },
                        { where: { transfer_id: exchange_id, owner_id: user_id } }
                    );
                } else if (exchange.initiator_id === user_id) {
                    await Transfer.update(
                        { current_status_initiator: TransferStatus.SENT },
                        { where: { transfer_id: exchange_id, initiator_id: user_id } }
                    );
                }

                const updatedExchange = await Transfer.findByPk(exchange_id);
                const offeringBooks = await OfferingBook.findAll({ where: { transfer_id: exchange_id } });
                if ((updatedExchange?.current_status_initiator === TransferStatus.SENT || offeringBooks.length === 0) && updatedExchange?.current_status_owner === TransferStatus.SENT) {
                    await Transfer.update(
                        { cur_status: TransferStatus.SENT, current_status_initiator: TransferStatus.SENT },
                        { where: { transfer_id: exchange_id } }
                    );
                }
            } 
            else if (exchange.cur_status === TransferStatus.SENT) {
                if (exchange.owner_id === user_id) {
                    await Transfer.update(
                        { current_status_owner: TransferStatus.RECEIVED },
                        { where: { transfer_id: exchange_id, owner_id: user_id } }
                    );
                } else if (exchange.initiator_id === user_id) {
                    await Transfer.update(
                        { current_status_initiator: TransferStatus.RECEIVED },
                        { where: { transfer_id: exchange_id, initiator_id: user_id } }
                    );
                }

                const updatedExchange = await Transfer.findByPk(exchange_id);
                const offeringBooks = await OfferingBook.findAll({ where: { transfer_id: exchange_id } });
                if (updatedExchange?.current_status_initiator === TransferStatus.RECEIVED && (updatedExchange?.current_status_owner === TransferStatus.RECEIVED || offeringBooks.length === 0)) {
                    await Transfer.update(
                        {
                            current_status_initiator: TransferStatus.COMPLETED_SUCCESS,
                            current_status_owner: TransferStatus.COMPLETED_SUCCESS,
                            cur_status: TransferStatus.COMPLETED_SUCCESS
                            
                        },
                        { where: { transfer_id: exchange_id } }
                    );
                    await Book.update(
                        { status: BookStatus.EXCHANGED },
                        { where: { book_id: exchange.book_id } }
                    );
                    const offeringBooks = await OfferingBook.findAll({ where: { transfer_id: exchange_id } });
                    const offeredBookIds = offeringBooks.map(ob => ob.book_id);
                    if (offeredBookIds.length > 0) {
                        await Book.update(
                            { status: BookStatus.EXCHANGED },
                            { where: { book_id: { [Op.in]: offeredBookIds } } }
                        );
                    }
                }
            }
        } 
        else if (activity === 'cancel') {
            if (exchange.cur_status === TransferStatus.WAITING_CONFIRMATION) {
                await Transfer.update(
                    { current_status_owner: TransferStatus.CANCELLED, current_status_initiator: TransferStatus.CANCELLED, cur_status: TransferStatus.CANCELLED },
                    { where: { transfer_id: exchange_id } }
                );
                await Book.update(
                    { status: BookStatus.AVAILABLE },
                    { where: { book_id: exchange.book_id } }
                );
                const offeringBooks = await OfferingBook.findAll({ where: { transfer_id: exchange_id } });
                const offeredBookIds = offeringBooks.map(ob => ob.book_id);
                if (offeredBookIds.length > 0) {
                    await Book.update(
                        { status: BookStatus.AVAILABLE },
                        { where: { book_id: { [Op.in]: offeredBookIds } } }
                    );
                }
            } else if (exchange.cur_status === TransferStatus.WAITING_RESPONSE) {
                await Transfer.destroy(
                    { where: { transfer_id: exchange_id } }
                );
                await Book.update(
                    { status: BookStatus.AVAILABLE },
                    { where: { book_id: exchange.book_id } }
                );
                const offeringBooks = await OfferingBook.findAll({ where: { transfer_id: exchange_id } });
                const offeredBookIds = offeringBooks.map(ob => ob.book_id);
                if (offeredBookIds.length > 0) {
                    await Book.update(
                        { status: BookStatus.AVAILABLE },
                        { where: { book_id: { [Op.in]: offeredBookIds } } }
                    );
                }
            } else if (exchange.cur_status === TransferStatus.WAITING_TO_BE_SENT || exchange.cur_status === TransferStatus.SENT) {
                await Transfer.update(
                    { current_status_owner: TransferStatus.COMPLETED_PREMATURELY, current_status_initiator: TransferStatus.COMPLETED_PREMATURELY, cur_status: TransferStatus.COMPLETED_PREMATURELY },
                    { where: { transfer_id: exchange_id } }
                );
                await Book.update(
                    { status: BookStatus.AVAILABLE },
                    { where: { book_id: exchange.book_id } }
                );
                const offeringBooks = await OfferingBook.findAll({ where: { transfer_id: exchange_id } });
                const offeredBookIds = offeringBooks.map(ob => ob.book_id);
                if (offeredBookIds.length > 0) {
                    await Book.update(
                        { status: BookStatus.AVAILABLE },
                        { where: { book_id: { [Op.in]: offeredBookIds } } }
                    );
                }
            }
        }
        return true;
    },   

    async deleteOfferingBooks( exchange_id: number, keptBookIds: number[]) {
        
        await OfferingBook.destroy({
            where: {
                transfer_id: exchange_id,
                book_id: {[Op.notIn]: keptBookIds}
            }
        })
    },

    async deleteOtherOffers(book_id: number, acceptOffer: number) {

        const otherTransfers = await Transfer.findAll({
            where: {
                book_id: book_id,
                transfer_id: { [Op.notIn]: [acceptOffer] }
            },
            include: [{ model: OfferingBook, as: 'offeringBooks' }]
        }); 

        if (otherTransfers.length === 0) return;

        const offeredBookIds: number[] = [];
        for (const transfer of otherTransfers) {
            const offeredBooks = await OfferingBook.findAll({
                where: {transfer_id: transfer.transfer_id}
            });
            if (offeredBooks) {
                for (const ob of offeredBooks) {
                    offeredBookIds.push(ob.book_id);
                }
            }
        }

        if (offeredBookIds.length > 0) {
        await Book.update(
            { status: BookStatus.AVAILABLE },
            { where: { book_id: { [Op.in]: offeredBookIds } } }
        );
    }
         
        await Transfer.destroy({
            where: {
                book_id,
                transfer_id: {[Op.notIn]: [acceptOffer]}
            }
        })
    },

    


    async getExchanges(user_id: number, type: 'incoming' | 'outcoming' | 'running' | 'ended', book_id?: number ) {

        const baseInclude = [
            { model: User, as: 'initiator', attributes: ['user_id', 'name', 'photo'] },
            { model: User, as: 'owner', attributes: ['user_id', 'name', 'photo'] },
            { model: Book, as: 'book', attributes: ['book_id', 'name'], include: [
                { model: BookPhoto, as: 'photos', attributes: ['photo_url'], required: false }
            ]},
            { model: OfferingBook, as: 'offeringBooks', include: [
                { model: Book, as: 'book', attributes: ['book_id', 'name'], include: [
                    { model: BookPhoto, as: 'photos', attributes: ['photo_url'], required: false }
                ]},
            ]},
        ];

        const where: any = {};

        if ( book_id ) {
            where.book_id = book_id;
        }


        if ( type === 'incoming' ) {
            where.owner_id = user_id;
            where.cur_status = { [Op.in]: [TransferStatus.WAITING_RESPONSE, TransferStatus.WAITING_CONFIRMATION] };
        } else if ( type === 'outcoming' ) {
            where.initiator_id = user_id;
            where.cur_status = { [Op.in]: [TransferStatus.WAITING_RESPONSE, TransferStatus.WAITING_CONFIRMATION] };
        } else if ( type === 'running' ) {
            where[Op.or] = [
                { owner_id: user_id },
                { initiator_id: user_id}
            ];
            where.cur_status = { [Op.in]: [TransferStatus.WAITING_TO_BE_SENT, TransferStatus.SENT, TransferStatus.RECEIVED] };
        } else if ( type === 'ended' ) {
            where[Op.or] = [
                { owner_id: user_id },
                { initiator_id: user_id}
            ];
            where.cur_status = { [Op.in]: [TransferStatus.CANCELLED, TransferStatus.COMPLETED_PREMATURELY, TransferStatus.COMPLETED_SUCCESS] };
        }

        return Transfer.findAll({
            where,
            include: baseInclude,
            order: [[ 'created_at', 'DESC' ]]
        })

        
    },
     
    async hasReview(transfer_id: number, user_id: number): Promise<boolean> {
        const review = await Review.findOne({ where: { transfer_id, reviewer_id: user_id } });
        return review !== null;
    }
}