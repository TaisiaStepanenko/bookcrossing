import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import {
    BookConditionValues,
    ExchangeMethodValues,
    BookCoverValues,
    BookStatusValues,
    ExchangeTypeValues,
    BookCover,
    BookCondition,
    ExchangeMethod,
    ExchangeType,
    BookStatus
} from '../constants/enums';
import User from './User';

interface BookAttributes {
    book_id: number;
    name: string;
    author: string;
    genre: string;
    cover: BookCover;
    publishing_house: string | null;
    year: number | null;
    series: string | null;
    description: string | null;
    condition: BookCondition;
    defects: string | null;
    exchangeMethod: ExchangeMethod;
    exchangeType: ExchangeType;
    obtaining_methods: string | null;
    status: BookStatus;
    owner_id: number;
    registration_date: string;
}

interface BookCreationAttributes extends Optional<BookAttributes, 
    'book_id' | 'publishing_house' | 'year' | 'series' | 'description' | 'defects' | 'obtaining_methods' | 'status' | 'registration_date'
> {}

class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
    public book_id!: number;
    public name!: string;
    public author!: string;
    public genre!: string;
    public cover!: BookCover;
    public publishing_house!: string | null;
    public year!: number | null;
    public series!: string | null;
    public description!: string | null;
    public condition!: BookCondition;
    public defects!: string | null;
    public exchangeMethod!: ExchangeMethod;
    public exchangeType!: ExchangeType;
    public obtaining_methods!: string | null;
    public status!: BookStatus;
    public owner_id!: number;
    public registration_date!: string;

    public isAvailable(): boolean {
        return this.status === 'AVAILABLE';
    }

    public getFullTitle(): string {
        return `${this.name} - ${this.author}`;
    }
}

Book.init(
    {
        book_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(300),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 300]
            }
        },
        author: {
            type: DataTypes.STRING(300),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 300]
            }
        },
        genre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 50]
            }
        },
        cover: {
            type: DataTypes.ENUM(...BookCoverValues),
            allowNull: false
        },
        publishing_house: {
            type: DataTypes.STRING(200),
            allowNull: true,
            defaultValue: null
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            validate: {
                min: 0,
                max: new Date().getFullYear()
            }
        },
        series: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        },
        condition: {
            type: DataTypes.ENUM(...BookConditionValues),
            allowNull: false
        },
        defects: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        },
        exchangeMethod: {
            type: DataTypes.ENUM(...ExchangeMethodValues),
            allowNull: false,
            field: 'exchangemethod'
        },
        exchangeType: {
            type: DataTypes.ENUM(...ExchangeTypeValues),
            allowNull: false,
            field: 'exchangetype'
        },
        obtaining_methods: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null
        },
        status: {
            type: DataTypes.ENUM(...BookStatusValues),
            allowNull: false,
            defaultValue: 'AVAILABLE'
        },
        owner_id: {
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
        registration_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'books',
        modelName: 'Book'
    }
);

export default Book;