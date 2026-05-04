import { BookCatalogItem, BookFilter, BookRepository } from "../repositories/bookRepository";
import {BookEdit} from '../repositories/bookRepository';
import Book from '../models/Book';
import { BookPhoto } from "../models";
import { deletePhotoFromDish } from "../utils/fs";
import { Op } from "sequelize";


export const bookService = {

    async getCatalog(filter: BookFilter, user_id?: number) {
        const copyFilter = {...filter};
        
        return BookRepository.findWithFilter(copyFilter, user_id);

    },


    async getBookInfo(book_id: number, user_id?: number) {
        const book = await BookRepository.getBookById(book_id, user_id);
        if ( !book ) {
            throw new Error('Book not found');
        }
        return book;
    },

    async addFavBook(user_id: number, book_id: number){
        const favBook = await BookRepository.addBookToFavorites({user_id, book_id});

        if (!favBook) {
            throw new Error('Book already in favorites or does not exist');
        }
        return { message: 'Book added to favorites' };
    },


    async addBook(bookInfo: BookEdit, user_id: number) {
        const newBook = await BookRepository.addNewBook(bookInfo, user_id);
        if (bookInfo.photos && bookInfo.photos.length > 0) {
            await BookRepository.addBookPhoto(newBook.book_id, bookInfo.photos);
        }
        return this.getBookInfo(newBook.book_id, user_id);
    },

    async updateBook(user_id: number, book_id: number, bookInfo: BookEdit) {
        const book = await Book.findByPk(book_id, { attributes: ['owner_id'] });
        if (!book) {
            throw new Error('Book not found');
        }
        if (book.owner_id !== user_id) {
            throw new Error('Forbidden');
        }
        const [affectedCount] = await BookRepository.updateBookInfo(book_id, bookInfo)
       

        if (affectedCount === 0) {
            throw new Error('Update failed');
        }

        
        if (bookInfo.deletedPhotos && bookInfo.deletedPhotos.length > 0) {
            for (const url of bookInfo.deletedPhotos) {
                
                deletePhotoFromDish(url);

                await BookPhoto.destroy({
                    where: { book_id: book_id, photo_url: url }
                });
            }
        }

        

        if (bookInfo.photos?.length) {
            const maxOrder: number = await BookPhoto.max('sort_order', { where: { book_id } }) || 0;
            const newPhotos = bookInfo.photos.map((p, i) => ({
                book_id,
                photo_url: p.url,
                is_main: false,
                sort_order: maxOrder + i + 1
            }));
            await BookPhoto.bulkCreate(newPhotos);
        }

        const allPhotos = await BookPhoto.findAll({
            where: { book_id: book_id },
            order: [['sort_order', 'ASC']]
        });

        if (allPhotos.length > 0) {
        for (let i = 0; i < allPhotos.length; i++) {
            await allPhotos[i].update({
                sort_order: i,
                is_main: i === 0
            });
        }
    }
        

        return this.getBookInfo(book_id, user_id);
        
    },


    async deleteBook(user_id: number, book_id: number) {
        const bookOwner = await Book.findByPk(book_id, { attributes: ['owner_id'] });
        if (!bookOwner) {
            throw new Error('Book not found');
        }
        if (bookOwner.owner_id !== user_id) {
            throw new Error('Forbidden');
        }

        const photos = await BookPhoto.findAll({ where: { book_id } });
        photos.forEach(p => deletePhotoFromDish(p.photo_url));

        const deletedCount = await BookRepository.deleteBook(book_id);
        if (deletedCount === 0) {
            throw new Error('Delete failed');
        }
        return { message: 'Book deleted successfully' };
    },

    async removeFavBook(user_id: number, book_id: number) {
        const deleted = await BookRepository.deleteBookFromFavorites({ user_id, book_id });
        
        if (deleted === 0) throw new Error('Favorite not found');
        return { message: 'Book removed from favorites' };
    }
}