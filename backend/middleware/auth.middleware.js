import jwt from 'jsonwebtoken';


export const authUser = async (req, res, next) => {
    try{
        
        // Extracting the Token
        const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

        // Checking If Token Exists
        if(!token){
            return res.status(401).send({ error: 'Unauthorized User' });
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