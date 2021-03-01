const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const urlParser = require("url");
const nodemailer = require("nodemailer");
const _ = require("lodash");
const { verifyJwtToken } = require("../config/jwtHelper");

const User = mongoose.model("User");

module.exports.register = (req, res, next) => {
  var user = new User();
  user.username = req.body.username;
  user.email = req.body.email;
  user.password = req.body.password;
  user.isVerified = false;
  user.emailToken = user.generateJwt();
  user.save((err, doc) => {
    if (!err) {
      //sendEmail(doc._id, doc.email, doc.emailToken);
      res.send(doc);
    } else {
      if (err.code == 11000)
        res.status(422).send(["Duplicate email adrress found."]);
      else return next(err);
    }
  });
};

module.exports.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate("local", (err, user, info) => {
    // error from passport middleware
    if (err) {
      return res.status(400).json(err);
    }
    // registered user
    else if (user) {
        if(!user.isVerified){
            return res.status(404).json({message:"Your profile is not verified"});
        }
      return res.status(200).json({ token: user.generateJwt() });
    }
    // unknown user or wrong password
    else {
        console.log(info);
      return res.status(404).json(info);
    }
  })(req, res);
};

module.exports.userProfile = (req, res, next) => {
  User.findOne({ _id: req._id }, (err, user) => {
    if (!user)
      return res
        .status(404)
        .json({ status: false, message: "User record not found." });
    else
      return res
        .status(200)
        .json({ status: true, user: _.pick(user, ["username", "email"]) });
  });
};

module.exports.verify = (req, res, next) => {
  var user = new User();
  const { id, emailToken } = req.query;
  User.findOne({ _id: id }, (err, user) => {
    if (!user)
      return res
        .status(404)
        .json({ status: false, message: "User record not found." });
    else if (user.emailToken == emailToken) {
      user.isVerified = true;
    }
    return res
      .status(200)
      .json({ status: true, user: _.pick(user, ["username", "email"]) });
  });
};

function sendEmail(id, email, token) {
  const url = `${process.env.EMAIL_URL}?emailToken=${token}&id=${id}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.email",
    port: 587,
    auth: {
      user: email,
      pass: "**********8",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  try {
    let mailOptions = transporter.sendMail({
      from: '"HHHHHH GGGGGG"<maye.price@ethereal.email>',
      to: email,
      subject: "Hello World",
      text: "Hello World",
      html: `<b>${url}</b>`,
    });

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        //
      } else {
        //
      }
    });
  } catch (error) {}
}
