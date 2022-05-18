const jwt = require("jsonwebtoken");
const config = require("dotenv").config().parsed;
var cookies = require("cookie-parser");
module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies["jwt"];
  if (!token) {
    res.setHeader("Content-Type", "application/json");
    res.status(401);
    res.write("Not Logged In");
    res.end();
  }
  // const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, config.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.setHeader("Content-Type", "application/json");
        res.status(401);
        res.write("Not Logged In");
        res.end();
      } else {
        next();
      }
    });
  } else {
    res.setHeader("Content-Type", "application/json");
    res.status(401);
    res.write("Not Logged In");
    res.end();
  }
};
