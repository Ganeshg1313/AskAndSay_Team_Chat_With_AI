// Role: To control the user operations

import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import {validationResult} from 'express-validator'; // Used to validate and sanitize user input in an application.
import redisClient from '../services/redis.service.js';

export const createUserController = async (req, res) => {

    // Check validation results
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try{
        // Calling create user method from services
        const user = await userService.createUser(req.body);

        // Generating JWT token by calling the instance method 
        const token = await user.generateJWT();

        // returning the user and jwt token
        res.status(201).send({user, token});
    }
    catch(error){
        res.status(400).send(error.message);
    }

}

export const loginController = async (req, res) => {

     const errors = validationResult(req);

     if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
     }

     try{
        const {email, password} = req.body;

        const user = await userModel.findOne({email}).select('+password'); 
        // As we have set password = false by default, so while querying we need to explicitly select the password too.

        if(!user){
            return res.status(401).json({
                errors: 'Invalid Credentials'
            });
        }

        const isMatch = await user.isValidPassword(password);

        if(!isMatch){
            return res.status(401).json({
                errors: 'Invalid Credentials'
            });
        }

        const token = await user.generateJWT();

        res.status(200).json({user, token});
     }
     catch(error){
        res.status(400).send(error.message);
    }

}

// This should only work for authenticated user (logged in user)
export const profileController = async (req, res) => {

    res.status(200).json({
        user: req.user
    })
}

export const logoutController = async (req, res) => {
    try {

        // Extract the token
        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

        // Stores the token in redis with value set to logout
        // Sets an expiration time for the key to avoid indefinite storage
        redisClient.set(token, 'logout', 'EX' ,60*60*24);

        res.status(200).json({
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        res.status(400).send(error.message);
    }
}