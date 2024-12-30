//Role: To authenticate user

import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';


export const authUser = async (req, res, next) => {
    try{
        
        // Extracting the Token
        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

        // Checking If Token Exists
        if(!token){
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // Find if the token is present in redis
        const isBlackListed = await redisClient.get(token);

        // If True: user has logged out
        if(isBlackListed){
            // By setting the cookie’s value to an empty string (''), the token becomes invalid for further use.
            res.cookie('token', '');    
            return res.status(401).send({ error: 'Unauthorized User'});
        }

        // Verifying the Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adding the Decoded User Information to the Request
        req.user = decoded;

        // Passing Control to the Next Middleware or Route Handler
        next();
    }
    catch(error){
        res.status(401).send({ error: 'Unauthorized User '});
    }
}