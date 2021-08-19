import { DataTypes } from 'sequelize';
import { database } from '../database';


export const AccountModel = database.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(64),
    },
    auth_key: {
        type: DataTypes.STRING(64)
    },
    balance: {
        type: DataTypes.INTEGER
    },
    rank_points: {
        type: DataTypes.INTEGER
    }
}, { tableName: 'account' });