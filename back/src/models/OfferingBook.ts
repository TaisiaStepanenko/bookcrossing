import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Transfer from './Transfer';
import Book from './Book';

interface OfferingBookAttributes {
    offering_book_id: number;  
  	transfer_id: number;
  	book_id: number;
  	sort_order: number
}

interface OfferingBookCreationAttributes extends Optional<OfferingBookAttributes, 'offering_book_id'> {}

class OfferingBook extends Model<OfferingBookAttributes, OfferingBookCreationAttributes> implements OfferingBookAttributes {
    public offering_book_id!: number;  
  	public transfer_id!: number;
  	public book_id!: number;
  	public sort_order!: number
}

OfferingBook.init ({
    offering_book_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },   
  	transfer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references  : {
            model: Transfer,  
            key: 'transfer_id'
        }
    },
  	book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references  : {
            model: Book,  
            key: 'book_id'
        }
    },
  	sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    
}, { sequelize,
    timestamps: false,
    tableName: 'offering_book',
    modelName: 'OfferingBook'
 });



export default OfferingBook;

	