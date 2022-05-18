const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = require("dotenv").SALT_ROUNDS;
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: [true, "User id is Required"],
    unique: [true, "User Id already used"],
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    minLength: [6, "Password Length must be atleast 6"],
  },
  email: {
    type: String,
    required: [true, "Email Address is Required"],
    unique: [true, "Email Already Registered"],
  },
  image: {
    type: String,
  },
  firstName: {
    type: String,
    default: "null",
  },
  lastName: {
    type: String,
    default: "null",
  },
});
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(parseInt(saltRounds));
  this.password = await bcrypt.hash(this.password, salt);
});
userSchema.statics.login = async function (user_id, password) {
  const user = await this.findOne({ user_id });

  if (user) {
    const auth = await bcrypt.compare(password, user.password);

    if (auth) {
      return user;
    }
    throw Error("Incorrect Password");
  }
  throw Error("Invalid User Id");
};
const User = mongoose.model("user", userSchema);
module.exports = User;
