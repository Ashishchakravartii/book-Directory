const mongoose = require("mongoose");
const plm = require("passport-local-mongoose")
const data = mongoose.Schema({
  passwordResetToken: {
    type: Number,
    default: 0,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Username field must not empty"],
    minLength: [4, "Username field must have atleast 4 characters"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, "Email address is required"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email address",
    ],
  },
  password: String,
});

data.plugin(plm)
const user= mongoose.model("userData",data);
module.exports=user;