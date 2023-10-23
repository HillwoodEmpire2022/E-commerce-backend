import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local"; 
import { OAuth2Strategy } from "passport-oauth"
import User from "../models/user.js";
import { generateUserName } from "../controllers/auth.js";

export const passportConfig = async () => {
  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: "https://accounts.google.com/o/oauth2/auth",
        tokenURL: "https://accounts.google.com/o/oauth2/token",
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
        scope: ["email", "profile"],
        passReqToCallback: true,
      },
      async (req,accessToken, refreshToken, profile, done) => { 
        try {
          console.log(req.user);
          const existingUser = await User.findOne({ googleId: profile.id })
          if (!existingUser) {
            const userName = await generateUserName()
              
            const newUser = new User({
              googleId: profile.id,
              firstname: profile._json.given_name,
              lastname: profile._json.family_name,
              username: userName,
              email: profile._json.email,
              userValidated: true,
            });  
            const user = await User.create(newUser)              
            
            return done(null, user)  
          } else {
            const user = existingUser
            return done(null, user) 
          } 
        } catch (err) { 
            console.log(err);
          return done(err, null)
        }
      }
    )
  );  
};
