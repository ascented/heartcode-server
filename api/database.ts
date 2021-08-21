import { Sequelize } from 'sequelize';
import Log from './utils/cl';


const log = new Log('Database');
export const database = new Sequelize('heartcode', 'postgres', 'ascent', {
    dialect: 'postgres',
    logging: msg => log.info(msg)
});