const mongoose = require("mongoose");

function connectDB() {
  return mongoose.connect(process.env.DB_URL || "mongodb://127.0.0.1:27017/fairshare");
}

module.exports = connectDB;