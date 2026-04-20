import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Region from './Region';

interface CityAttributes {
    city_id: number;
    name: string;
    region_id: number;
}

interface CityCreationAttributes extends Optional<CityAttributes, 'city_id'> {}

class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
    public city_id!: number;
    public name!: string;
    public region_id!: number;
}

City.init( {
    city_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    region_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Region,  
            key: 'region_id'
        }
    }
}, { sequelize,
    timestamps: false,
    tableName: 'cities',
    modelName: 'City'
 });

export default City;