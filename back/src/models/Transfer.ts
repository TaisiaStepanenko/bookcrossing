import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Book from './Book';
import {
    TransferTypeValues,
    OfferTypeValues,
    TransferStatusValues,
    TransferType,
    OfferType,
    TransferStatus,
} from '../constants/enums';


interface TransferAttributes {
    transfer_id: number;   
	initiator_id: number;
	owner_id: number;
	book_id: number;
	initiator_confirm: boolean; 
	owner_confirm: boolean; 
	type: TransferType; 
	offerType: OfferType; 
	current_status_initiator: TransferStatus; 
	current_status_owner: TransferStatus; 
	created_at: string
}

interface TransferCreationAttributes extends Optional<TransferAttributes, 'transfer_id' | 'initiator_confirm' | 'owner_confirm' | 'type' |
    'current_status_initiator' | 'current_status_owner' | 'created_at'> {}

class Transfer extends Model<TransferAttributes, TransferCreationAttributes> implements TransferAttributes {
    public transfer_id!: number;   
	public initiator_id!: number;
	public owner_id!: number;
	public book_id!: number;
	public initiator_confirm!: boolean; 
	public owner_confirm!: boolean; 
	public type!: TransferType; 
	public offerType!: OfferType; 
	public current_status_initiator!: TransferStatus; 
	public current_status_owner!: TransferStatus; 
	public created_at!: string
}

Transfer.init ({
    transfer_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },   
	initiator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references  : {
            model: User,  
            key: 'user_id'
        }
    },
	owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,  
            key: 'user_id'
        }
    },
	book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Book,  
            key: 'book_id'
        }
    },
	initiator_confirm: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }, 
	owner_confirm: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }, 
	type: {
        type: DataTypes.ENUM(...TransferTypeValues),
        allowNull: false,
        defaultValue: 'REQUEST'
    }, 
	offerType: {
        type: DataTypes.ENUM(...OfferTypeValues),
        allowNull: false,
        field: 'offertype'
    }, 
	current_status_initiator: {
        type: DataTypes.ENUM(...TransferStatusValues),
        allowNull: false,
        defaultValue: 'WAITING_RESPONSE'
    }, 
	current_status_owner: {
        type: DataTypes.ENUM(...TransferStatusValues),
        allowNull: false,
        defaultValue: 'WAITING_RESPONSE'
    }, 
	created_at: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    }
    
}, { 
    sequelize,
    timestamps: false,
    tableName: 'transfers',
    modelName: 'Transfer',
    indexes: [  
        {
            fields: ['initiator_id'],
            name: 'idx_transfers_initiator'
        },
        {
            fields: ['owner_id'],
            name: 'idx_transfers_owner'
        }
    ]
 });



 export default Transfer;

	