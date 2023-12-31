/* const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Musko", "Zensko"],
    },
    address: String,
    phone: Number,
    joinedTime: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["admin", "korisnik"],
      required: true,
    },
  },
  { strictPopulate: false } 
);

const User = mongoose.model("users", userSchema); 
module.exports = User; */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Musko", "Zensko"],
    },
    address: String,
    phone: Number,
    joinedTime: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["admin", "korisnik"],
      required: true,
    },
    photo: String, //slika usera- URL
  },
  { strictPopulate: false }
);

const User = mongoose.model("users", userSchema);
module.exports = User;
