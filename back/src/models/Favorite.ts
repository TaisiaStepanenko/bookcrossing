import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';  
import Book from './Book';  


interface FavoriteAttributes {
    favorites_id: number;
    user_id: number;
    book_id: number;
}


interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'favorites_id'> {}

class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
    public favorites_id!: number;
    public user_id!: number;
    public book_id!: number;
}


Favorite.init(
    {
        favorites_id: {
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
            }
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Book,
                key: 'book_id'
            }
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'favorites',
        modelName: 'Favorite',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'book_id']
            },
            {  
                fields: ['user_id'],
                name: 'idx_favorites_user'
            }
        ]
    }
);


export default Favorite;