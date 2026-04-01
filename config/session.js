const session = require("express-session");
const MongoStore = require("connect-mongo");

function sessionConfig() {
  return session({
    secret: process.env.SESSION_SECRET || "fairsharesecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fairshare",
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,                          // prevents client-side JS access
      secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
      maxAge: 1000 * 60 * 60,                  // 1 hour
    },
  });
}

module.exports = sessionConfig;