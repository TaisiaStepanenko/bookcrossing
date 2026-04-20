import {app} from './app';
import { env } from './config/env';
import { sequelize } from './config/database';

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected');
        app.listen(env.port, () => console.log(`Server on port ${env.port}`));
    } catch (error) {
        console.error('Start error', error);
    }
}  

start();       