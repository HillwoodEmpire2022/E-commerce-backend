export const isLoggedIn = (req, res, next) => {
    console.log("log", req.returnPayload);
    req.returnPayload ? next()

        : res.status(401).send({
            message: "You are unauthorized. Please login again"
        })
}
 
export default isLoggedIn
