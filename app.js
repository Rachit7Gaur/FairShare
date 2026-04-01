require("dotenv").config();
const express = require("express");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");

const connectDB = require("./config/db");       // <-- import
const sessionConfig = require("./config/session");
const passportConfig = require("./config/passport");
const flashConfig = require("./config/flash");

const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const dashboardRoutes = require("./routes/dashboard");
const expenseRoutes = require("./routes/expense");

const app = express();

// ✅ Connect to local DB
connectDB();

// View engine setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set("layout", "layout");

// Session middleware
app.use(sessionConfig());

// Passport setup
const passport = passportConfig();
app.use(passport.initialize());
app.use(passport.session());

// Flash setup
flashConfig(app);

// Root route
app.get("/", (req, res) => res.render("home"));

// Routes
app.use("/", authRoutes);
app.use("/groups", groupRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/groups", expenseRoutes);

// Test route for flash
app.get("/test-flash", (req, res) => {
  req.flash("success", "This is a success message!");
  req.flash("error", "This is an error message!");
  req.flash("info", "This is an info message!");
  res.redirect("/");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error stack:", err.stack);
  res.status(500).render("error", { message: "Something went wrong!" });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FairShare running on port ${PORT}`);
});