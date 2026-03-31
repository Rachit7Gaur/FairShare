const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const User = require('./models/user');
const Group = require('./models/group');
const Expense = require('./models/expense');

const app = express();

mongoose.connect(process.env.DB_URL || 'mongodb://127.0.0.1:27017/fairshare');

app.set('view engine', "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(session({
  secret: 'fairsharesecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL || 'mongodb://127.0.0.1:27017/fairshare',
    collectionName: 'sessions'
  })
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.user; 
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info"); 
  next();
});

function calculateBalances(expenses, members) {
  const balances = {};

  // Initialize balances for each member
  members.forEach(member => {
    balances[member._id] = 0;
  });

  expenses.forEach(expense => {
    const share = expense.amount / expense.splitAmong.length;

    expense.splitAmong.forEach(member => {
      if (member._id.toString() !== expense.paidBy._id.toString()) {
        // Member owes their share
        balances[member._id] -= share;
        // PaidBy gets credited
        balances[expense.paidBy._id] += share;
      }
    });
  });

  return balances;
}

function minimizeSettlements(balances, members) {
  const creditors = [];
  const debtors = [];

  members.forEach(member => {
    const balance = balances[member._id];
    if (balance > 0) creditors.push({ member, balance });
    else if (balance < 0) debtors.push({ member, balance: -balance });
  });

  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  const settlements = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);

    settlements.push({
      from: debtor.member.username,
      to: creditor.member.username,
      amount
    });

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return settlements;
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


//Root Route 
app.get('/',(req,res)=>{
  // res.send("Root route is working");
  res.render("home");
})

//Reister
app.get('/register',(req,res)=>{
  // res.send("register route is working");
  res.render("register");
});

app.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    const newUser = new User({ username, email });
    await User.register(newUser, password);

    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Account created successfully! Welcome, " + newUser.username + "!");
      return res.redirect("/dashboard");
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Registration failed: " + err.message);
    res.redirect("/register");
  }
});

//Login
app.get('/login',(req,res)=>{
  // res.send("login route is working");
  res.render("login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("error", info.message || "Invalid username or password");
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash("success", "Welcome back, " + user.username + "!");
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

//Logout
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash("success", "You have logged out successfully.");
    res.redirect('/');
  });
});


//Dashboard
app.get("/dashboard",
  isLoggedIn,
  async (req,res)=>{
    try {
      const userGroups = await Group.find({ members: req.user._id });
      res.render('dashboard', { 
        title: 'Dashboard',
        layout: 'layout',
        user: req.user, 
        userGroups 
       });
    } catch (err) {
      console.error(err);
      res.send(err.message);
    }
});

//Group
app.post("/groups", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      req.flash("error", "Group name cannot be empty.");
      return res.redirect("/groups/new");
    }

    const group = new Group({
      name,
      owner: req.user._id,
      members: [req.user._id]
    });

    await group.save();

    req.flash("success", "Group created successfully!");
    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create group: " + err.message);
    res.redirect("/dashboard");
  }
});

//individual group
app.get("/groups/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid group ID");
    }

    const group = await Group.findById(id)
      .populate("owner")
      .populate("members")
      .populate({
        path: "expenses",
        populate: [{ path: "paidBy" }, { path: "splitAmong" }]
      });

    const balances = calculateBalances(group.expenses, group.members); 
    const settlements = minimizeSettlements(balances, group.members);

    if (!group) {
      return res.status(404).send("Group not found");
    }

    const allUsers = await User.find({});

    res.render("groupDetails", { layout: "layout", group, expenses: group.expenses, allUsers , balances , settlements });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

//members
// Show add member page
app.get("/groups/:id/add-member", async (req, res) => {
  const group = await Group.findById(req.params.id).populate("members");
  res.render("addMember", { layout: "layout", group });
});

app.post("/groups/:id/members", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      req.flash("error", "Group not found!");
      return res.redirect("/groups");
    }

    const identifier = req.body.identifier;
    const user = await User.findOne({ 
      $or: [{ username: identifier }, { email: identifier }] 
    });

    if (!user) {
      req.flash("error", "No user found with that username or email.");
      return res.redirect(`/groups/${group._id}`);
    }

    if (group.members.includes(user._id)) {
      req.flash("info", `${user.username} is already a member of this group.`);
      return res.redirect(`/groups/${group._id}`);
    }

    group.members.push(user._id);
    await group.save();

    req.flash("success", `${user.username} added to the group successfully!`);
    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add member: " + err.message);
    res.redirect(`/groups/${req.params.id}`);
  }
});

//expenses

app.get("/groups/:id/add-expense", async (req, res) => {
  const group = await Group.findById(req.params.id).populate("members");
  res.render("addExpense", { layout: "layout", group });
});

app.post("/groups/:id/expenses", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
     if (!group) {
      req.flash("error", "Group not found!");
      return res.redirect("/groups");
    }

    const { description, amount, paidBy, splitAmong } = req.body;

    // const user = await User.findOne({ $or: [{ username: paidBy }, { email: paidBy }] });
    // if (!user) return res.status(404).send("User not found");

    const expense = new Expense({
      description,
      amount,
      paidBy,
      group: group._id,
      splitAmong: Array.isArray(splitAmong) ? splitAmong : [splitAmong]
    });

    await expense.save();

    group.expenses.push(expense._id);
    await group.save();

    req.flash("success", "Expense added successfully!");

    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while adding expense.");
    res.redirect(`/groups/${req.params.id}`);
  }
});


app.listen('3000',()=>{
  console.log("FairShare running on port 3000");
});