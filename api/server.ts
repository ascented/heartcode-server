import * as http from 'http';
import express from 'express';
import AccountController from './account';


const app = express();
const server = http.createServer(app);


app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/', AccountController.router);


server.listen(8080, () => console.log('Started'));