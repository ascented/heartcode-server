import * as http from 'http';
import * as express from 'express';
import ClientController from './client';


const app = express();
const server = http.createServer(app);


app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/', ClientController.router);


server.listen(8080, () => console.log('Started'));