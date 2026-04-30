import { number } from "zod/v4";
import { OfferType, TransferStatus } from "../constants/enums";
import { Book, BookPhoto, OfferingBook, Transfer, User } from "../models";
import { Op } from "sequelize";


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

    

    async findById(transferId: number) {
        return Transfer.findByPk(transferId, {
        include: ['initiator', 'owner', 'book', 'offeringBooks'],
        });
    },

    async getAllIncomingExchanges(user_id: number): Promise<any> {
        return Transfer.findAll({
            where: {owner_id: user_id},
            include: [
                {model: User, as: 'initiator', attributes: ['user_id', 'name', 'photo']},
                {model: Book, as: 'book', attributes: ['book_id', 'name'], include: [
                    {model: BookPhoto, as: 'photos', attributes: ['photo_url'], required: false}
                ]}
            ],
            order: [['created_at', 'DESC']],
        });
    },

    async cancelAllBookExchanges(book_id: number, owner_id: number): Promise<number> {
        const [affectedCount] = await Transfer.update(
            {current_status_owner: TransferStatus.CANCELLED, current_status_initiator: TransferStatus.CANCELLED, cur_status: TransferStatus.CANCELLED},
            { where: {book_id: book_id, owner_id: owner_id, current_status_owner: TransferStatus.WAITING_RESPONSE}},
        )

        return affectedCount;
    },

    
    
    
    async changeStatus(exchange_id: number, user_id: number, activity: 'accept' | 'cancel', keptBookIds?: number[]) {

        const exchange = await Transfer.findByPk(exchange_id);
        let affectedCount: number | undefined = 0;
        
        if (activity === 'accept') {
            if (exchange?.cur_status === TransferStatus.WAITING_RESPONSE) {
                [affectedCount] = await Transfer.update(
                    { current_status_owner: TransferStatus.WAITING_CONFIRMATION, current_status_initiator: TransferStatus.WAITING_CONFIRMATION, cur_status: TransferStatus.WAITING_CONFIRMATION},
                    { where: { transfer_id: exchange_id }}
                );
                if (keptBookIds !== undefined) {
                    await this.deleteOfferingBooks(exchange_id, keptBookIds);
                } 
                await this.deleteOtherOffers(exchange.book_id, exchange_id);
                
            } else if (exchange?.cur_status === TransferStatus.WAITING_CONFIRMATION) {
                [affectedCount] = await Transfer.update(
                    { current_status_owner: TransferStatus.WAITING_TO_BE_SENT, current_status_initiator: TransferStatus.WAITING_TO_BE_SENT, cur_status: TransferStatus.WAITING_TO_BE_SENT},
                    { where: { transfer_id: exchange_id }}
                );
            } else if (exchange?.cur_status === TransferStatus.WAITING_TO_BE_SENT) {
                if (exchange.owner_id === user_id) {
                    [affectedCount] = await Transfer.update(
                        { current_status_owner: TransferStatus.SENT},
                        { where: { transfer_id: exchange_id, owner_id: user_id}}
                    );
                } else if (exchange.initiator_id === user_id) {
                    [affectedCount] = await Transfer.update(
                        { current_status_initiator: TransferStatus.SENT},
                        { where: { transfer_id: exchange_id, initiator_id: user_id}}
                    );
                }
                
                const updatedExchange = await Transfer.findByPk(exchange_id);
                if (updatedExchange?.current_status_initiator === TransferStatus.SENT && updatedExchange?.current_status_owner === TransferStatus.SENT) {
                    [affectedCount] = await Transfer.update(
                        { cur_status: TransferStatus.SENT},
                        { where: { transfer_id: exchange_id}}
                    );

                    await this.deleteBooks(updatedExchange.book_id, keptBookIds);
                }

            } else if (exchange?.cur_status === TransferStatus.SENT) {
                if (exchange.owner_id === user_id) {
                    [affectedCount] = await Transfer.update(
                        { current_status_owner: TransferStatus.RECEIVED},
                        { where: { transfer_id: exchange_id, owner_id: user_id}}
                    );
                } else if (exchange.initiator_id === user_id) {
                    [affectedCount] = await Transfer.update(
                        { current_status_initiator: TransferStatus.RECEIVED},
                        { where: { transfer_id: exchange_id, initiator_id: user_id}}
                    );
                }
                
                const updatedExchange = await Transfer.findByPk(exchange_id);
                if (updatedExchange?.current_status_initiator === TransferStatus.RECEIVED && updatedExchange?.current_status_owner === TransferStatus.RECEIVED) {
                    [affectedCount] = await Transfer.update(
                        { current_status_initiator: TransferStatus.COMPLETED_SUCCESS, current_status_owner: TransferStatus.COMPLETED_SUCCESS, cur_status: TransferStatus.COMPLETED_SUCCESS},
                        { where: { transfer_id: exchange_id}}
                    );
                }
            }

        } else if (activity === 'cancel') {
            if (exchange?.cur_status === TransferStatus.WAITING_RESPONSE || exchange?.cur_status === TransferStatus.WAITING_CONFIRMATION) {
                [affectedCount] = await Transfer.update(
                    {current_status_owner: TransferStatus.CANCELLED, current_status_initiator: TransferStatus.CANCELLED, cur_status: TransferStatus.CANCELLED},
                    { where: { transfer_id: exchange_id }}
                );
            } else if (exchange?.cur_status === TransferStatus.WAITING_TO_BE_SENT || exchange?.cur_status === TransferStatus.SENT) {
                [affectedCount] = await Transfer.update(
                    {current_status_owner: TransferStatus.COMPLETED_PREMATURELY, current_status_initiator: TransferStatus.COMPLETED_PREMATURELY, cur_status: TransferStatus.COMPLETED_PREMATURELY},
                    { where: { transfer_id: exchange_id }}
                );
            }
        }

        return affectedCount;
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
         
        await Transfer.destroy({
            where: {
                book_id,
                transfer_id: {[Op.notIn]: [acceptOffer]}
            }
        })
    },

    async deleteBooks(book_id: number, offeringBooks?: number[]) {
        await Book.destroy({
            where: { book_id }
        })

        await Book.destroy({
            where: {
                book_id: {[Op.notIn]: offeringBooks}
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

        
    }
}