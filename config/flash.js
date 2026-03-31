const flash = require("connect-flash");

function flashConfig(app) {
  app.use(flash());
  app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");
    next();
  });
}

module.exports = flashConfig;