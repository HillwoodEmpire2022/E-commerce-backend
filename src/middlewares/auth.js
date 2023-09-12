import { verifyJWToken } from "../utils/jsonWebToken.js";

export const isLoggedIn = (req, res, next) => {
 try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json("Access denied. Please login again.");
  
    const userInfo = verifyJWToken(token);
    userInfo.userInfo
      ? next()
      : res.status(401).json({
          message: "Access denied. Please login again",
        });
 } catch (error) {
    res.status(500).send({message: error.message})    
 }
};

export const isAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) return res.status(401).json("Access denied. Please login again.");
      
        const decodedUserInfo = verifyJWToken(token);

        if (decodedUserInfo.userInfo.role === "admin") {
          next();
          return decodedUserInfo;
        } else {
          res.status(403).json({
            message: "You are not an admin. Contact an admin to help you.",
          });
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
};
