import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import User from "../models/user.js";

export const passportConfig = async () => {
  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
        scope: ["email", "profile"],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });
          if (!existingUser) {
            const userName = await generateUserName();

            const newUser = new User({
              googleId: profile.id,
              firstname: profile._json.given_name,
              lastname: profile._json.family_name,
              username: userName,
              email: profile._json.email,
              userValidated: true,
            });
            const user = await User.create(newUser).catch((error) => {
              done(error, null);
            });

            return done(null, user);
          } else {
            const user = existingUser;
            return done(null, user);
          }
        } catch (err) {
          console.log(err);
          return done(err, null);
        }
      }
    )
  );
};

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
  const user = await User.findOne({ _id: id }).catch((error) => {
    cb(error, null);
  });
  if (user) cb(null, user);
});
