
const express = require("express");
const router = express.Router();
// import mongoose when dealing with errors in .catch()
const mongoose = require("mongoose");

const bcryptjs = require("bcryptjs");


// import the model
const User = require("../models/User.model");

const saltRounds = 10;

router.get("/auth/signup", (req, res, next) => {
    res.render("auth/signup.hbs");
  });
  
  // POST route to save the user inside the database
  router.post("/signup", (req, res, next) => {
    //   console.log(req.body);
  
    const { username, email, userPassword } = req.body;
  
    if (!username || !email || !userPassword) {
      res.render("auth/signup.hbs", {
        errorMessage: "All fields are mandatory. Please provide username, email and password."
      });
      return;
    }
  
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(userPassword)) {
      res.render("auth/signup.hbs", {
        errorMessage:
          "Password needs to be at least 6 characters long, and needs to have at least one number, one lowercase and one uppercase letter."
      });
      return;
    }
    bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(userPassword, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        // passwordHash is the key from User model and hashedPassword is a placeholder (this is how we named the returning value from the .hash() method)
        passwordHash: hashedPassword
      }).then((userFromDB) => {
        // console.log(userFromDB);
        res.redirect("/profile");
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.render("auth/signup.hbs", {
          errorMessage: "Username and email need to be unique. Either username or email is already used."
        });
      } else if (err instanceof mongoose.Error.ValidationError) {
        res.render("auth/signup.hbs", { errorMessage: err.message });
      } else {
        console.log("Error while creating a user: ", err);
      }
    });
});

router.get("/auth/login", (req, res, next) => {
    res.render("auth/login.hbs");
  });
  
  // <form action="/login" method="POST">
  router.post("/login", (req, res, next) => {
    const { email, userPassword } = req.body;
  
    if (!email || !userPassword) {
      res.render("auth/login.hbs", {
        errorMessage: "All fields are mandatory. Please provide both, email and password."
      });
      return;
    }
  
    //            email (the key form the model ): email (what user submitted in the form)
    User.findOne({ email })
      .then((responseFromDB) => {
        // responseFromDB can be either NULL if the email doesn't exist in the users collection
        // or the USER OBJECT since the user is found in the DB based on the provided email
  
        // console.log("session: ", req.session);
  
        if (!responseFromDB) {
          res.render("auth/login.hbs", { errorMessage: "Email is not registered. Try different email please." });
        } else if (bcryptjs.compareSync(userPassword, responseFromDB.passwordHash)) {
          // console.log("logged in user is: ", responseFromDB);
  
          // currentUser ==> this is a placeholder, you can name it however you want
          req.session.currentUser = responseFromDB;
  
          // console.log("do i have user in session: ", req.session.currentUser);
          // res.render("users/profile.hbs", { user: responseFromDB });
  
          res.redirect("/profile");
        } else {
          res.render("auth/login.hbs", { errorMessage: "Incorrect password." });
        }
      })
      .catch((err) => console.log(`Error while user login: ${err}`));
  });
  
module.exports = router;