const express = require("express");
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const connectDB = require("./config/db");
const sessionConfig = require("./config/session");
const passportConfig = require("./config/passport");
const flashConfig = require("./config/flash");

const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const dashboardRoutes = require("./routes/dashboard");
const expenseRoutes = require("./routes/expense");

const app = express();

connectDB();

app.set('view engine', "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(sessionConfig());

const passport = passportConfig();
app.use(passport.initialize());
app.use(passport.session());

flashConfig(app);

//Root Route 
app.get('/',(req,res)=>{  res.render("home");});

//authentication Routes
app.use("/", authRoutes);

//Groups Routes
app.use("/groups", groupRoutes);

//Dashboard Routes
app.use("/dashboard", dashboardRoutes);

//expenses Routes
app.use("/groups", expenseRoutes);

//Server Route
app.listen('3000',()=>{
  console.log("FairShare running on port 3000");
});