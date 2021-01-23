// User model here
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      // this match will not take into account emails with empty spaces, missing dots in front of the .domainName
      // and if there is no domain at all
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = model("User", userSchema);