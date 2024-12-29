// Role: Setup the server 
// NOTE: We want to use http to create server as we will be using websocket to communicate and http module is convinient to handle websocket than express
// Because of this we shifted the express part in the app.js

import http from 'http';
import app from './app.js';
import connect from './db/db.js';
import 'dotenv/config';

// Establishing database connection
connect();

const port = process.env.PORT || 5555;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});