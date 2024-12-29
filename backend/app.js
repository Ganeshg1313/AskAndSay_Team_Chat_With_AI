// Role: To apply the middlewares

import express from "express";
import morgan from 'morgan' // log HTTP requests in the console or monitoring purposes.
import cors from 'cors' // Enables Cross-Origin Resource Sharing (CORS), allowing your application to accept requests from other origins (domains). 

const app = express()

app.use(morgan('dev')) //The 'dev' argument specifies the logging format. In the 'dev' format, logs appear in a concise, colorful format.

app.use(express.json()); //The JSON data is converted into a JavaScript object and attached to req.body
app.use(express.urlencoded({extended: true}))
app.use(cors()) //Optional


// A root get request 
app.get('/', (req,res) => {
    return res.status(234).send('Welcome')
})


export default app;


