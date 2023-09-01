import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import User from "../models/user.js";
import { generateUserName } from "./userNameGenerator.js";
import  { googleAuthenticationSuccess } from "../controllers/auth.js"

export const passportConfig = async () => {
  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
      },
      async (accessToken, refreshToken, profile, done) => { 
        try {
          const user = await User.findOne({ googleId: profile.id })
          if (!user) {
            const userName = await generateUserName()
              
            const newUser = new User({
              googleId: profile.id,
              firstname: profile._json.given_name,
              lastname: profile._json.family_name,
              username: userName,
              email: profile._json.email,
              userValidated: true,
            });  
            const createdUser = await User.create(newUser)              
            const returnPayload = googleAuthenticationSuccess(createdUser)
            return done(null, createdUser)  
  
          } else {
            const returnPayload = googleAuthenticationSuccess(user) 
            
            return done(null, user) 
          } 
        } catch (err) { 
          return done(err, null)
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const user = User.findById(id);
    return done(null, user);
  });
};
