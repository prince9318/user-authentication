import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { google } from "./env.js";
import db from "../models/index.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: google.clientId,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this googleId
        let user = await db.User.findOne({
          where: { googleId: profile.id },
          include: [{ model: db.Role, as: "role" }],
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await db.User.findOne({
          where: { email: profile.emails[0].value },
          include: [{ model: db.Role, as: "role" }],
        });

        if (user) {
          // Update user with googleId
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const userRole = await db.Role.findOne({ where: { name: "user" } });

        user = await db.User.create({
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          isVerified: true, // Google verified email
          roleId: userRole.id,
        });

        // Include role information
        user = await db.User.findByPk(user.id, {
          include: [{ model: db.Role, as: "role" }],
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id, {
      include: [{ model: db.Role, as: "role" }],
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
