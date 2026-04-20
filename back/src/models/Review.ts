import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Transfer from './Transfer';
import User from './User';


interface ReviewAttributes {
    review_id: number;
    transfer_id: number;
    reviewer_id: number;
    reviewed_user_id: number;
    rating: number | null;
    comment: string | null;
    review_date: string;
}


interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'review_id' | 'comment' | 'review_date'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    public review_id!: number;
    public transfer_id!: number;
    public reviewer_id!: number;
    public reviewed_user_id!: number;
    public rating!: number | null;
    public comment!: string | null;
    public review_date!: string;

}

Review.init(
    {
        review_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
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
        reviewer_id: {
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
        reviewed_user_id: {
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
        comment: {
            type: DataTypes.TEXT,
            defaultValue: null,
            validate: {
                len: [0, 1000]  
            }
        },
        review_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'reviews',
        modelName: 'Review'
    }
);


export default Review;