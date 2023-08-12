var express = require("express");
var router = express.Router();
const UserDb = require("../models/userModel");
const bookDb = require("../models/bookData");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const { sendmail } = require("../utils/mail");

passport.use(new LocalStrategy(UserDb.authenticate()));
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" ,user: req.user});
});
router.get("/signup", function (req, res, next) {
  res.render("signup", { user: req.user });
});
router.post("/signup", async function (req, res, next) {
  try {
    const { username, email, password } = req.body;
    let user = { username, email };
    await UserDb.register(user, password);
    res.redirect("/signin");
  } catch (error) {
    res.send(error.message);
  }
});
router.get("/signin", function (req, res, next) {
  res.render("signin", { user: req.user });
});

router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/signin",
    successRedirect: "/main",
  }),
  async function (req, res, next) {}
);

router.get("/main", isLoggedIn, async (req, res) => {
  try {
    console.log(req.user);
    const data = await bookDb.find();
    res.render("main", { bookDb: data, user: req.user });
  } catch (error) {
    console.log(error);
  }
});
router.get("/update/:id", async (req, res) => {
  const data = await bookDb.findById(req.params.id);
  res.render("updatedir", { bookDb: data, user: req.user });
});
router.post("/update/:id", async (req, res) => {
  try {
    await bookDb.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/main");
  } catch (error) {
    console.log(error);
  }
});

router.get("/create", async (req, res) => {
  res.render("create", { user: req.user });
});
router.post("/create", async (req, res) => {
  try {
    const data = await new bookDb(req.body);
    data.save();
    res.redirect("/main");
  } catch (error) {
    console.log(error);
  }
});
router.get("/delete/:id", async (req, res) => {
  try {
    await bookDb.findByIdAndDelete(req.params.id);
    res.redirect("/main");
  } catch (error) {}
});
router.get("/signout", (req, res) => {
  req.logout(() => {
    res.redirect("/signin");
  });
});

router.get("/get-email", function (req, res, next) {
  res.render("getemail", { user: req.user });
});
router.post("/get-email", async function (req, res, next) {
  try {
    const user = await UserDb.findOne({ email: req.body.email });

    if (user == null) {
      return res.send(
        `User not found. <a href="/get-email">Forget Password</a>`
      );
    }
    sendmail(req, res, user);
  } catch (error) {
    res.send(error);
  }
});

router.get("/change-password/:id", async (req, res, next) => {
  try {
    //  const user= await UserDb.findById(req.params.id)
    res.render("changePassword", { id: req.params.id, user: req.user });
  } catch (error) {
    res.send(error);
  }
});
router.post("/change-password/:id", async (req, res, next) => {
  try {
    const user = await UserDb.findById(req.params.id);
    if (user.passwordResetToken === 1) {
      await user.setPassword(req.body.password);
      user.passwordResetToken = 0;
    } else {
      res.send(
        `link expired try again <a href="/get-email">Forget Password</a>`
      );
    }
    await user.save();
    res.redirect("/signin");
  } catch (error) {
    res.send(error)
  }
});

router.get("/reset/:id",isLoggedIn,(req,res,next)=>{
 res.render("reset",{id:req.params.id, user:req.user})
});
router.post("/reset/:id",isLoggedIn,async(req,res,next)=>{
try {
 await req.user.changePassword(req.body.oldpassword,req.body.password);
 await req.user.save();
 res.redirect("/main")
} catch (error) {
  res.send(error)
}
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/signin");
}

module.exports = router;
