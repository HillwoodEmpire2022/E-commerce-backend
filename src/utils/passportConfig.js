import passport from "passport";
import { Strategy } from "passport-google-oauth20"
import User from "../models/User.js";


export const passportConfig = () => { 
    passport.use(new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK
    },
        (accessToken, refreshToken, profile, done) => { 
            console.log(profile);
        }));
    passport.serializeUser((user, done) => { 
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => { 
        User.findById(id, (err, user) => done(err, user))
    })
}
