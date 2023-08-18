import User from "../models/User";
import bcrypt from "bcrypt"
import { signupValidationSchema } from "../validations/signupValidation";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const userRegister = async (req, res) => { 
    try {
        const { 
            firstname,
            lastname,
            email,
            password,
        } = req.body

        const { error } = signupValidationSchema.validate(req.body)
        if (error) {
            res.status(422).send({ message: error.message })
        }

        const salt = await bcrypt.genSalt()
        const passwordHarsh = await bcrypt.hash(password, salt)

        const newUser = {
            firstname,
            lastname,
            email,
            hashedPassword: passwordHarsh,
        }

        const savedUser = await User.create(newUser)
        const userToken = jwt.sign({
            id: savedUser._id
        }, process.env.SECRET_KEY)

        res.status(201).json({
            userToken,
            user: savedUser
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}