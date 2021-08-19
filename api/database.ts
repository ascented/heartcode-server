import { Sequelize } from 'sequelize';
import Log from './utils/cl';


const log = new Log('Database');
export const database = new Sequelize('postgresql://localhost:5432/heartcode', {
    logging: msg => log.info(msg)
});