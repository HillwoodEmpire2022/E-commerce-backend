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
            // User.findOne({ googleId: profile.id }, (err, user) => { 
            //     if (!user) {
            //         user = new User({
            //             googleId: profile.id,
            //             firstname: profile.
            //         });
            //     }
            // })
            console.log(profile.name, profile.familyName, profile.photos, profile._json)
            return done(null, profile)
        }));
    passport.serializeUser((user, done) => { 
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => { 

        const user = User.findById(id)
        return done(null, user)    

    })
}
