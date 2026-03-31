const session = require("express-session");
const { MongoStore } = require("connect-mongo");

function sessionConfig() {
  return session({
    secret: "fairsharesecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL || "mongodb://127.0.0.1:27017/fairshare",
      collectionName: "sessions"
    })
  });
}

module.exports = sessionConfig;