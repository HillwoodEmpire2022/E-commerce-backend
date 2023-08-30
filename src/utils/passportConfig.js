import passport from "passport";
import { Strategy } from "passport-google-oauth20"
import User from "../models/User.js";
import { generateUserName } from "./userNameGenerator.js"


export const passportConfig = () => { 
    passport.use(new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK
    },
        (accessToken, refreshToken, profile, done) => { 
            User.findOne({ googleId: profile.id }).then((user) => { 

                if (!user) {
                    generateUserName().then((userName) => { 
                        user = new User({
                            googleId: profile.id,
                            firstname: profile._json.given_name,
                            lastname: profile._json.family_name,
                            username: userName,
                            email: profile._json.email,
                        });
                        User.create(user).then((err, user) => {
                            return done(null, user)
                        })
                    }).catch(err => { 
                        return done(err.message)
                    })

                    
                } else { 
                    return done(null, user)
                }

            }).catch(err => { 
                return done(err.message)
            })              
        }));
    passport.serializeUser((user, done) => { 
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => { 

        const user = User.findById(id)
        return done(null, user)    

    })
}
