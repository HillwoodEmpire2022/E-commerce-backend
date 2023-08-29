import jwt from "jsonwebtoken" 

const generateJWToken = (id) => { 
    const userToken = jwt.sign({
        id: id
    }, process.env.SECRET_KEY, { expiresIn: '1h' }) 
    
    return userToken;
}

export default generateJWToken;
