import jwt from "jsonwebtoken" 

export const generateJWToken = (userInfo) => { 
    const userToken = jwt.sign(userInfo, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }) 
    
    return userToken;
}

export const verifyJWToken = (userToken) => { 
    jwt.verify(userToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
        return decoded
    });
}

