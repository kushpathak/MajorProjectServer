const jwt = require("jsonwebtoken");
const config = require("dotenv").config().parsed;
var cookies = require("cookie-parser");
module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies["jwt"];
  if (!token) {
    res.setHeader("Content-Type", "application/json");
    res.write("Not Logged In");
  }
  // const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.setHeader("Content-Type", "application/json");
        res.write("Not Logged In");
      } else {
        next();
      }
    });
  } else {
    res.setHeader("Content-Type", "application/json");
    res.write("Not Logged In");
  }
};
