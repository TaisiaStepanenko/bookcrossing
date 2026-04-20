import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';
import  City from './City';

interface UserAttributes {
    user_id: number;
    name: string;
    email: string;
    password: string;
    phone: string | null;
    city_id: number;
    birthday_date: string;
    rating: number | null;
    photo: string | null;
    description: string | null;
    notification_number: number;
    registration_date: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 
    'user_id' | 'phone' | 'rating' | 'photo' | 'description' | 'notification_number' | 'registration_date'
> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public user_id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public phone!: string | null;
    public city_id!: number;
    public birthday_date!: string;
    public rating!: number | null;
    public photo!: string | null;
    public description!: string | null;
    public notification_number!: number;
    public registration_date!: string;

}

User.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true  
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(15),
            defaultValue: null
        },
        city_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: City,  
                key: 'city_id'
            }
        },
        birthday_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: null,
            allowNull: true,
            validate: {
                isDecimal: true,
                min: 1,
                max: 5,
                isNullOrInRange(value: number | null) {
                    if (value !== null && (value < 1 || value > 5)) {
                        throw new Error('Rating must be between 1 and 5 when provided');
                    }
                }
            }
        },
        photo: {
            type: DataTypes.STRING(255),
            defaultValue: null
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: null  
        },
        notification_number: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        registration_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        }
    },
    { 
        sequelize,
        timestamps: false,
        tableName: 'users',
        modelName: 'User',
        indexes: [ 
            {
                fields: ['email'],
                unique: true
            },
            {
                fields: ['city_id'],
                name: 'idx_users_city'
            }
        ]
    }
);


export default User;