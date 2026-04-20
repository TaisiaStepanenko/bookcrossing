import { includes } from "zod/v4";
import { OfferType, TransferStatus } from "../constants/enums";
import { Book, BookPhoto, OfferingBook, Transfer, User } from "../models";


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
            {current_status_owner: TransferStatus.CANCELLED},
            { where: {book_id: book_id, owner_id: owner_id, current_status_owner: TransferStatus.WAITING_RESPONSE}},
        )

        return affectedCount;
    },

    async getAllIncomingExchangesById(book_id: number, owner_id: number): Promise<any> {
        return Transfer.findAll({
            where: {book_id: book_id, owner_id: owner_id},
            include: [
                {model: User, as: 'initiator', attributes: ['user_id', 'name', 'photo']},
                {model: Book, as: 'book', attributes: ['book_id', 'name'], include: [
                    {model: BookPhoto, as: 'photos', attributes: ['photo_url'], required: false}
                ]},
                {model: OfferingBook, as: 'offeringBooks', include: [
                    {model: Book, as: 'book', attributes: ['book_id', 'name'], include: [
                        {model: BookPhoto, as: 'photos', attributes: ['photo_url'], required: false}
                    ]},
                ]},
            ],
            order: [['created_at', 'DESC']],
        });
    },
    
    
    async cancelExchangeById(exchange_id: number, owner_id: number) {
        const [affectedCount] = await Transfer.update(
            {current_status_owner: TransferStatus.CANCELLED},
            { where: {
                transfer_id: exchange_id, 
                owner_id: owner_id, 
                current_status_owner: TransferStatus.WAITING_RESPONSE
            }}
        );
        return affectedCount;
    },

    async acceptExchange(transferId: number, ownerId: number): Promise<number> {
        const [affectedCount] = await Transfer.update(
            { current_status_owner: TransferStatus.WAITING_CONFIRMATION, owner_confirm: true},
            { where: {
                transfer_id: transferId,
                owner_id: ownerId,
                current_status_owner: TransferStatus.WAITING_RESPONSE
            }}
        );
        return affectedCount;
    }
}