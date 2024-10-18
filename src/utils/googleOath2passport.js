import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth2';
import User from '../models/user.js';

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      // Find user with email in profile
      try {
        let user = await User.findOne({ email: profile.email });

        // If User does not exits, create him/her
        if (!user) {
          user = await User.create({
            firstName: profile.given_name,
            lastName: profile.family_name,
            email: profile.email,
            password: 'password',
            role: 'user',
            verified: true,
          });
          return done(null, user);
        }

        // If user exits, return him
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
export const googleOath2passport = passport;
