const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user-model");

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.PASSPORT_SECRET;

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        const user = await User.findOne({ _id: jwt_payload._id });
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/user/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let foundUser = await User.findOne({
            email: profile.emails[0].value,
          });

          if (foundUser) {
            return done(null, foundUser);
          } else {
            const newUser = new User({
              username: profile.displayName,
              email: profile.emails[0].value,
              googleID: profile.id,
              thumbnail: profile.photos[0].value,
              password: Math.random().toString(36).slice(-10),
              role: "customer",
            });
            const savedUser = await newUser.save();
            return done(null, savedUser);
          }
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};
