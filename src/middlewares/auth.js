import { verifyJWToken } from "../utils/jsonbWebToken"

export const isLoggedIn = (req, res, next) => {
    const token = req.header('auth_token')
    if (!token) return res.status(401).json('Access denied. Please login again.')

    const userInfo = verifyJWToken(token)
    userInfo ? next()
        : res.status(401).json({
            message: "Access denied. Please login again"
        })
}
 
export const isAdmin = (req, res, next) => { 
    const token = req.header('auth_token')
    if (!token) return res.status(401).json('Access denied. Please login again.')

    const decodedUserInfo = verifyJWToken(token)
    if (decodedUserInfo.role === 'admin') {
        next()
        return decodedUserInfo
    } else { 
        res.status(403).json({
            message: "You are not an admin. Contact an admin to help you."
        })
    }
}
