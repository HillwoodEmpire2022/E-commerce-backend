import User from "../models/User.js";
import bcrypt from "bcrypt"
import { signupValidationSchema, loginValidationSchema } from "../validations/authValidations.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const userRegister = async (req, res) => { 
    try {
        let { 
            firstname,
            lastname,
            email,
            password,
        } = req.body

        const { error } = signupValidationSchema.validate(
            req.body,
            { errors: { label: 'key', wrap: { label: false } } })
        if (error) {
            res.status(422).send({ message: error.message })
            return
        }

        const salt = await bcrypt.genSalt()
        const passwordHarsh = await bcrypt.hash(password, salt)

        const recentRegisteredUser = await User.find().sort({ _id: -1 }).limit(1)
        let newUserName = ""

        firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase()
        lastname = lastname.charAt(0).toUpperCase()+lastname.slice(1).toLowerCase()

        if (recentRegisteredUser.length !== 0) {
            const collectionCount = recentRegisteredUser[0].username.slice(4)
            newUserName = `user${parseInt(collectionCount) + 1}`
        } else {
            newUserName = `user${1}`      
        }

        const newUser = {
            firstname,
            lastname,
            username: newUserName,
            email,
            hashedPassword: passwordHarsh, 
        }

        const savedUser = await User.create(newUser)
        const userToken = jwt.sign({
            id: savedUser._id
        }, { expiresIn: '1h' }, process.env.SECRET_KEY)

        res.status(201).json({
            userToken,
            user: savedUser
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const userLogin = async (req, res) => { 
    try {
        let { 
            email,
            password,
        } = req.body

        const { error } = loginValidationSchema.validate(
            req.body,
            { errors: { label: 'key', wrap: { label: false } } })
        if (error) {
            res.status(422).send({ message: error.message })
        }
        
        let userInfo = {}
        const account = await User.findOne({email:email})
        if (!account) {
            res.status(401).send({ message: "The email provided does not exist."})
        } else {
            
            const passwordCheck = await bcrypt.compare(password, account.hashedPassword)
            
           
            if (!passwordCheck) {
                res.status(401).send({ message: "Wrong password."})
            } else {
                userInfo = {
                    _id: account._id,
                    firstname: account.firstname,
                    lastname: account.lastname,
                    username: account.username,
                    role: account.role,
                    profileImageUrl: account.profileImageUrl,

                } 

                const userToken = jwt.sign({
                    _id: account._id
                }, { expiresIn: '1h' }, process.env.SECRET_KEY)

                res.status(200).json({
                    token: userToken,
                    user: userInfo,
                })
            }
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }  
}
