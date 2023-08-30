import express from "express";
import { userRegister, userLogin } from "../controllers/auth.js"
import passport from "passport"
import generateJWToken from "../utils/jwToken.js";



const router = express.Router()

router.post("/user/register", userRegister)
router.post("/user/login", userLogin)
router.get("/auth/google", passport.authenticate("google", { scope: ["email","profile"] }))
router.get("/google/callback", passport.authenticate("google",
    {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
    }), (req, res) => { 
    // const userToken = generateJWToken(req.user.id)
    // res.status(200).json({
    //     token: userToken,
    //     user: req.user,
    // })
    console.log(req.user);
    }
)    

router.get("auth/google/success", (req, res) => { 
    try {
        console.log('try')
        console.log(req)
        res.send(req.user)
    } catch (err) { 
        console.log(err.message)
        res.status(500).send(err.message)
    }


    // res.status(200).json({ user: req.user})
})

router.get("auth/google/failure", (req, res) => { 
    console.log(failed);
    res.status(401).json({
        message: "Unable to sign in using Google, please try again later"
    })
})

export default router
