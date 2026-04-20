import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RegionAttributes {
    region_id: number;
    name: string;
}

interface RegionCreationAttributes extends Optional<RegionAttributes, 'region_id'> {}

class Region extends Model<RegionAttributes, RegionCreationAttributes> implements RegionAttributes {
    public region_id!: number;
    public name!: string
}

Region.init({
    region_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, { sequelize,
    timestamps: false,
    tableName: 'regions',
    modelName: 'Region'
 });



export default Region;