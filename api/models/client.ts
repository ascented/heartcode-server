import { DataTypes } from 'sequelize';
import { database } from '../database';


export const ClientModel = database.define('Client', {
    type: {
        type: DataTypes.INTEGER,
    },
    uid: {
        type: DataTypes.STRING,
    },
    api_token: {
        type: DataTypes.STRING(64)
    }
}, { tableName: 'client' });