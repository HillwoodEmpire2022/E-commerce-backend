import express from "express";
import user from "../controllers/user"


const router = express.Router()

router.post("/user/account/register", user)

export default router
