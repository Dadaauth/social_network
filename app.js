require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({ /////for session creation needed for authentication.
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/socialDB");

const userSchema = new mongoose.Schema({
    username: String,
    password:  String,
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const messageSchema = {
    message: String
};

const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
            return cb(null, {
        id: user.id,
        username: user.username,
      });
      
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

const Message = mongoose.model("Message", messageSchema);


app.get("/message", (req, res) => {
    Message.find({}, (err, found) => {
         res.render("message", {messages: found});
    });

});

app.post("/message", (req, res) => {
    const message = new Message({
        message: req.body.message
    });
    message.save();
    res.redirect("/");
});

app.get("/deleteMessage/:messageId", (req, res) => {
    Message.findByIdAndDelete({_id: req.params.messageId}, (err, done) => {
        if(err){
            res.send(err);
        } else if (done){
            res.redirect("/message");
        }
    });
});

app.listen(3000, () => {console.log("app running on port 3000");});