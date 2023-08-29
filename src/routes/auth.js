import express from "express";
import { userRegister, userLogin } from "../controllers/auth.js"
import passport from "passport"


const router = express.Router()

router.post("/user/register", userRegister)
router.post("/user/login", userLogin)
// router.get("/google", passport.authenticate("google", { scope: ["profile"] }))
// router.get("/google/callback", passport.authenticate("google",
//     {
//         scope: ["email","profile"] ,
//         failureRedirect: '/auth/google/failure'
//     }), (req, res) => {
  
//         console.log("accout");
//         res.status(201).json({
//             message: "Your account has been created"
//         })
// })


// router.get("/auth/google/failure", (req, res) => { 
//     console.log(failed);
//     res.status(401).json({
//         message: "Unable to sign in using Google, please try again later"
//     })
// })

export default router
