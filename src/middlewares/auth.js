import { verifyJWToken } from "../utils/jsonWebToken.js";

export const isLoggedIn = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: "Access denied. Please login again." });
        return;
      }
      
      const userInfo = verifyJWToken(token);
      if (userInfo.userInfo) {
        req.userId = userInfo.userInfo._id
        next();
      } else {
        res.status(401).json({
          message: "Access denied. Please login again",
        });
        return;
      }
    } else {
      return res.status(401).send({ message: "You have to provide JWToken for Authorizaion header for this API." });
    }  
 } catch (error) {
    return res.status(500).send({ message: error.message });
 }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) return res.status(401).json("Access denied. Please login again.");
    
      const decodedUserInfo = verifyJWToken(token);

      if (decodedUserInfo.userInfo.role === "admin") {
        req.userId = decodedUserInfo.userInfo._id
        next();
      } else {
        res.status(403).json({
          message: "You are not an admin. Contact an admin to help you.",
        });
      }
    } else {
      return res.status(401).send({ message: "You have to provide JWToken for Authorizaion header for this API." })
    }    
  } catch (error) {
      res.status(500).send({ message: error.message })
  }
};
