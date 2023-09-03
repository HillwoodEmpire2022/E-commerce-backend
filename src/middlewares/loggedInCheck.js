export const isLoggedIn = (req, res, next) => {

    req.user ? next()
        : res.status(401).send({
            message: "You are unauthorized. Please login again"
        })
}
 
export default isLoggedIn
