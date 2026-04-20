import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Book from './Book';

interface BookPhotoAttributes {
    photo_id: number;
    book_id: number;
    photo_url: string;
	is_main: boolean;
    sort_order: number;
}

interface BookPhotoCreationAttributes extends Optional<BookPhotoAttributes, 'photo_id'> {}

class BookPhoto extends Model<BookPhotoAttributes, BookPhotoCreationAttributes> implements BookPhotoAttributes {
    public photo_id!: number;
    public book_id!: number;
    public photo_url!: string;
	public is_main!: boolean;
    public sort_order!: number;
}

BookPhoto.init ({
    photo_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    book_id: {
        type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Book,  
                key: 'book_id'
            }
    },
    photo_url: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
	is_main: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, { 
    sequelize,
    timestamps: false,
    tableName: 'book_photos',
    modelName: 'BookPhoto'
 });



 export default BookPhoto;

	