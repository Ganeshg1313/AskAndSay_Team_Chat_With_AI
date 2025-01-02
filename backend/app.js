// Role: To apply the middlewares and add routes

import express from "express";
import morgan from 'morgan' // log HTTP requests in the console or monitoring purposes.
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(morgan('dev')); //The 'dev' argument specifies the logging format. In the 'dev' format, logs appear in a concise, colorful format.

app.use(cors());
app.use(express.json()); //The JSON data is converted into a JavaScript object and attached to req.body
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); 
app.use('/users', userRoutes);


// A root get request 
app.get('/', (req,res) => {
    return res.status(234).send('Welcome');
})


export default app;


