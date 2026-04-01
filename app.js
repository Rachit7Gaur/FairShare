require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const express = require("express");
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const sessionConfig = require("./config/session");
const passportConfig = require("./config/passport");
const flashConfig = require("./config/flash");

const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const dashboardRoutes = require("./routes/dashboard");
const expenseRoutes = require("./routes/expense");

const app = express();

app.set('view engine', "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(sessionConfig());

const passport = passportConfig();
app.use(passport.initialize());
app.use(passport.session());

flashConfig(app);

// Root Route
app.get('/', (req, res) => res.render("home"));

// Routes
app.use("/", authRoutes);
app.use("/groups", groupRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/groups", expenseRoutes);

// Server
app.listen(3000, () => {
  console.log("FairShare running on port 3000");
});