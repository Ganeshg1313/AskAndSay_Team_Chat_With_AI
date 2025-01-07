// Role: To handle the interactions with third party services (e.g: MongoDB atlas)

import User from "../models/user.model.js";

export const createUser = async ({email, password}) => {

    if(!email || !password){
        throw new Error('Email and password are requested');
    }

    // Hash the password before storing in the database
    const hashedPassword = await User.hashPassword(password);
    
    const user = await User.create({
        email,
        password: hashedPassword
    });

    return user;

};

export const getAllUsers = async ({userId}) => {
    const users = await User.find({
        _id: {$ne: userId}
    });
    return users;
}