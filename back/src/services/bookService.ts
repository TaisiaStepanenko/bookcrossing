import { BookCatalogItem, BookFilter, BookRepository } from "../repositories/bookRepository";
import {BookEdit} from '../repositories/bookRepository';
import Book from '../models/Book';
import { BookPhoto } from "../models";
import { deletePhotoFromDish } from "../utils/fs";
import { Op } from "sequelize";


export const bookService = {

    async getCatalog(filter: BookFilter, user_id?: number) {
        const copyFilter = {...filter};
        if (user_id) {
            copyFilter.userId = user_id;
        }
        return BookRepository.findWithFilter(copyFilter);

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

        

        if (bookInfo.photos && bookInfo.photos.length > 0) {
            await BookRepository.addBookPhoto(book_id, bookInfo.photos);
        }

        const allPhotos = await BookPhoto.findAll({
            where: { book_id: book_id },
            order: [['sort_order', 'ASC']]
        });

        if (allPhotos.length > 0) {
        for (let i = allPhotos.length; i > 0; i--) {
            await allPhotos[i - 1].update({
                sort_order: allPhotos.length - i,
                is_main: allPhotos.length - i === 0  
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

        const deletedCount = await BookRepository.deleteBook(book_id);
        if (deletedCount === 0) {
            throw new Error('Delete failed');
        }
        return { message: 'Book deleted successfully' };
    }
}