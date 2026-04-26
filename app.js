require("dotenv").config();
const express = require("express");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");

const connectDB = require("./config/db");       
const sessionConfig = require("./config/session");
const passportConfig = require("./config/passport");
const flashConfig = require("./config/flash");

const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const dashboardRoutes = require("./routes/dashboard");
const expenseRoutes = require("./routes/expense");
const profileRoutes = require("./routes/profile");

const app = express();


connectDB();


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set("layout", "layout");

app.set('trust proxy', 1);
app.use(sessionConfig());

const passport = passportConfig();
app.use(passport.initialize());
app.use(passport.session());

flashConfig(app);

app.use((req, res, next) => {
  res.locals.messages = {
    error: req.flash("error"),
    success: req.flash("success")
  };
  next();
});


app.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }
  res.render("home");
});

app.use("/", authRoutes);
app.use("/groups", groupRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/groups", expenseRoutes);
app.use("/profile", profileRoutes);
app.get("/about", (req, res) => {res.render("about");});

app.use((err, req, res, next) => {
  console.error("🔥 Error stack:", err.stack);
  res.status(500).render("error", { message: "Something went wrong!" });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FairShare running on port ${PORT}`);
});