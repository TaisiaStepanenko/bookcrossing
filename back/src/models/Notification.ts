import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Transfer from './Transfer';
import {MessageTypeValues} from '../constants/enums'


interface NotificationAttributes {
    notification_id: number;
    user_id: number;
    target_user_id: number;
    transfer_id: number;
    message_type: string;
    is_read: boolean;
    created_at: string;
}


interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'notification_id' | 'is_read' | 'created_at'> {}


class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
    public notification_id!: number;
    public user_id!: number;
    public target_user_id!: number;
    public transfer_id!: number;
    public message_type!: string;
    public is_read!: boolean;
    public created_at!: string;

}

Notification.init(
    {
        notification_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'user_id'
            },
            onDelete: 'CASCADE',  
            onUpdate: 'CASCADE',
            validate: {
                isInt: true,
                min: 1
            }
        },
        target_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: 'user_id' }
        },
        transfer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Transfer,
                key: 'transfer_id'
            },
            onDelete: 'CASCADE',   
            onUpdate: 'CASCADE',
            validate: {
                isInt: true,
                min: 1
            }
        },
        message_type: {
            type: DataTypes.ENUM(...MessageTypeValues),
            allowNull: false,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'notifications',
        modelName: 'Notification',
        indexes: [  
            {
                fields: ['user_id'],
                name: 'idx_notifications_user'
            }
        ]   
    }
);

export default Notification;