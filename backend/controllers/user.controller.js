// Role: To control the user operations

import userModel from '../models/user.model.js';
import userService from '../services/user.service.js';
import {validationResult} from 'express-validator'; // Used to validate and sanitize user input in an application.

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