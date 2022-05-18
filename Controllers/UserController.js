const User = require("../Models/user");
const Blog = require("../Models/todo");
const Comment = require("../Models/comments");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Frequent = require("../Models/frequentTopics");
const config = require("dotenv").config().parsed;
const errorHandler = (e) => {
  if (e.message !== null && e.message === "User Already Exists. Please Login") {
    return {
      userName: "User_Id Already Exists",
    };
  } else if (e.message !== null && e.message === "Invalid Email Address") {
    return {
      email: "Invalid Email Address",
    };
  } else if (e.message !== null && e.message === "Incorrect Password") {
    return {
      password: "Incorrect Password",
    };
  } else if (e.message !== null && e.message === "Invalid User Id") {
    return {
      userName: "Incorrect User Id",
    };
  } else {
    const errors = {
      user_id: null,
      password: null,
      email: null,
    };
    if (!Object.values(e.erros))
      return {
        error: "Some Error Occured",
      };
    Object.values(e.errors).forEach((error) => {
      errors[error.path] = error.message;
    });
    return errors;
  }
};
module.exports.signup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const oldUser = await User.findOne({
      user_id: userName,
    });
    // console.log(oldUser);
    if (oldUser) {
      throw new Error("User Already Exists. Please Login");
    }
    if (email !== null && validator.isEmail(email) === false) {
      throw new Error("Invalid Email Address");
    }
    const newUser = await User.create({
      user_id: userName,
      password,
      email,
    });

    res.status(201).json(newUser);
  } catch (e) {
    const error = errorHandler(e);

    res.status(401).send(error);
  }
};
module.exports.login = async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const user = await User.login(user_id, password);

    const token = jwt.sign({ user_id }, config.JWT_SECRET, {
      expiresIn: 60 * 60 * 2,
    });

    res.cookie("jwt", token, {
      maxAge: 1000 * 60 * 60 * 2,
      path: "/",
      httpOnly: true,
    });

    res.status(201).json({
      user_id: user.user_id,
      email: user.email,
      jwt: token,
      image: user.image,
    });
  } catch (e) {
    // console.log(e);
    const error = errorHandler(e);
    res.status(404).json(error);
  }
};
module.exports.logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).send("Logged Out Successfully!");
  } catch (e) {
    console.log(e);
    res.status(401).send("Some Error Occured");
  }
};
module.exports.status = (req, res) => {
  res.status(201).send("Logged In");
};
module.exports.updateProfile = async (req, res) => {
  const author = req.body.userId;
  const image = req.file.filename;
  try {
    const user = await User.updateOne(
      {
        user_id: author,
      },
      {
        image,
      }
    );
    // console.log(user);
    res.status(200).send({
      image,
    });
  } catch (e) {
    console.log(e);
    res.status(404).send("Some Error Occured");
  }
};
module.exports.getProfile = async (req, res) => {
  const author = req.query.userId;
  try {
    const user = await User.find(
      { user_id: author },
      {
        image: 1,
        _id: 0,
      }
    );
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send("Some Erorr Occured");
  }
};
module.exports.getUserInfo = async (req, res) => {
  const author = req.query.userId;
  try {
    const user = await User.find(
      {
        user_id: author,
      },
      {
        _id: 0,
        password: 0,
      }
    );
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send("Some Error Occured");
  }
};
module.exports.updateUserDetails = async (req, res) => {
  const userId = req.body.userId;
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const originalUid = req.body.original;
  console.log(userId);
  try {
    // console.log(originalUid);
    const user = await User.updateOne(
      {
        user_id: originalUid,
      },
      {
        $set: {
          user_id: userId,
          email,
          firstName,
          lastName,
        },
      }
    );
    const updateAllusers = await Blog.updateMany(
      {
        author: originalUid,
      },
      {
        $set: {
          author: userId,
        },
      }
    );
    const updateAllComments = await Comment.updateMany(
      {
        userId: originalUid,
      },
      {
        $set: {
          userId: userId,
        },
      }
    );
    res.status(200).send("Updated Details");
  } catch (e) {
    console.log(e);
    res.status(401).send("Some Error Occured");
  }
};
module.exports.updateFrequency = async (req, res) => {
  const { user_id, tagString } = req.body;
  var tags = tagString.split(" ");
  try {
    const record = await Frequent.findOne({
      user_id,
    });
    var newTags = [];
    if (record) {
      // To check if the tags of existing records are present in the new tags
      // If so then updating the count of the tag by 1 else leaving it as it was
      for (var i = 0; i < record["tags"].length; i++) {
        var tag = record["tags"][i]["tag"];
        var found = 0;
        for (var j = 0; j < tags.length; j++) {
          if (tags[j] === tag) {
            found = 1;
            break;
          }
        }
        if (found) {
          newTags.push({
            tag: record["tags"][i]["tag"],
            count: record["tags"][i]["count"] + 1,
          });
        } else {
          newTags.push({
            tag: record["tags"][i]["tag"],
            count: record["tags"][i]["count"],
          });
        }
      }
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        var found = 0;
        for (var j = 0; j < record["tags"].length; j++) {
          if (record["tags"][j]["tag"] === tag) {
            found = 1;
            break;
          }
        }
        if (found == 0) {
          newTags.push({
            tag,
            count: 1,
          });
        }
      }
      const updatedRecord = await Frequent.updateOne(
        {
          user_id,
        },
        {
          $set: {
            tags: newTags,
          },
        }
      );
    } else {
      for (var i = 0; i < tags.length; i++) {
        newTags.push({
          tag: tags[i],
          count: 1,
        });
      }
      const newRecord = await Frequent.create({
        user_id,
        tags: newTags,
      });
    }

    res.status(200).json("Records updated");
  } catch (e) {
    console.log(e);
    res.status(404).send("Some Error Occured");
  }
};
module.exports.getSuggestions = async (req, res) => {
  const { user_id } = req.query;
  try {
    const records = await Frequent.findOne({
      user_id,
    });
    const tags = records.tags;
    tags.sort((a, b) => {
      return a.count < b.count;
    });
    tags.reverse();
    var newBlogs = [];
    var bucket = new Map();
    for (var i = 0; i < tags.length; i++) {
      const blogs = await Blog.aggregate([
        {
          $match: {
            tags: new RegExp(tags[i].tag, "i"),
          },
        },
        {
          $lookup: {
            from: "users",
            as: "user_details",
            let: { user_id: "$author" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$user_id"],
                  },
                },
              },
              {
                $project: {
                  password: 0,
                  email: 0,
                  firstName: 0,
                  _id: 0,
                  lastName: 0,
                },
              },
            ],
          },
        },
      ]);
      console.log(blogs.length);
      if (bucket.has(blogs[0].title) === false) {
        bucket.set(blogs[0].title, 1);
        newBlogs.push(blogs[0]);
      }
    }
    res.status(200).send(newBlogs);
  } catch (e) {
    res.status(404).send("Some Error Occured");
  }
};
