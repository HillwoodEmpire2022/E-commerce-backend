import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import User from "../models/user.js";
import { generateUserName } from "./userNameGenerator.js";

export const passportConfig = async () => {
  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
      },
      async (accessToken, refreshToken, profile, done) => {
        const user = await User.findOne({ googleId: profile.id })
        if (!user) {
          const userName = await generateUserName()
            
          user = new User({
            googleId: profile.id,
            firstname: profile._json.given_name,
            lastname: profile._json.family_name,
            username: userName,
            email: profile._json.email,

          
          });  
          const createdUser = await User.create(user)  
            
          return done(createdUser)  

        
        } else {
            return done( user);
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
