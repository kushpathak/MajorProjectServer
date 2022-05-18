const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv").config().parsed;
const API = require("./Routes/API");
const server = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { requireAuth } = require("./Middlewares/authController");
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
server.use(cors(corsOptions));
server.set("view engine", "ejs");
server.use(express.json());
server.use(express.static("public"));
server.use(cookieParser());
const PORT = 9000;
const dbURI = env.MONGO_URI
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("All Good!");
    server.listen(PORT);
  })
  .catch((err) => console.log(err));
server.get("/", requireAuth, (req, res) => {
  res.send("Server Running");
});
server.use(API);
