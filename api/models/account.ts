import { DataTypes } from 'sequelize';
import { database } from '../database';


export const AccountModel = database.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(64),
    },
    password_hash: {
        type: DataTypes.STRING(64)
    },
    api_token: {
        type: DataTypes.STRING(64)
    },
    balance: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rank_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, { tableName: 'account' });