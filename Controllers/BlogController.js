const { db, off } = require("../Models/todo");
const Blog = require("../Models/todo");
const User = require("../Models/user");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Trending = require("../Models/trending");
const ErrorHandler = (error) => {
  var Error = { title: "", snippet: "" };
  Object.values(error.errors).forEach((val) => {
    Error[val.properties.path] = val.properties.message;
  });
  return Error;
};
const compare = (blog_1, blog_2) => {
  // console.log(blog_1.clicks > blog_2.clicks);
  return blog_1.clicks < blog_2.clicks;
};
module.exports.blogAdd = async (req, res) => {
  const title = req.body.title;
  const author = req.body.author;
  const tags = req.body.tags;
  var image = null;
  if (req.file) image = req.file.filename;
  const snippet = req.body.snippet;
  try {
    const duplicate = await Blog.find({ title: title });
    if (duplicate.length > 0) {
      res.status(401).json({
        Error: {
          title: "Blog Already Exists!",
          snippet: "",
        },
      });
    } else {
      const blog = await Blog.create({ title, author, tags, snippet, image });
      res.status(201).json("Added Blog");
    }
  } catch (err) {
    const Error = ErrorHandler(err);
    res.status(401).send({ Error });
  }
};
module.exports.blogGetAll = async (req, res) => {
  const page = req.query.page;
  const limit = parseInt(req.query.limit);

  try {
    const blogs = await Blog.aggregate([
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
    blogs.reverse();
    res.status(201).json(blogs);
  } catch (err) {
    console.log(err);
    res.status(401).send("Some Error Occured");
  }
};
module.exports.getBlogCount = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(201).json({ len: blogs.length });
  } catch (err) {
    const Error = ErrorHandler(err);
    res.status(401).json({ Error });
  }
};
module.exports.blogGetOne = async (req, res) => {
  try {
    // console.log(req.query);
    var param = req.query.title;
    const blog = await Blog.find({ title: param });
    if (blog.length === 0) {
      throw new Error("No Such Blog Exists!");
    } else res.status(201).json(blog);
  } catch (err) {
    const Error = ErrorHandler(err);
    res.status(401).json({ Error });
  }
};
module.exports.blogDelete = async (req, res) => {
  try {
    var param = req.body.title;
    var author = req.body.author;

    const response = await Blog.deleteOne({ title: param, author });
    res.status(201).send("Ok Deleted!");
  } catch (err) {
    const Error = ErrorHandler(err);
    res.status(401).json({ Error });
  }
};
module.exports.blogGetTitle = async (req, res) => {
  const title = req.query.title;
  const author = req.query.author;
  try {
    const reviews = await Blog.find({
      title,
      author,
    });
    res.status(201).send(reviews);
  } catch (e) {
    res.status(401).json("Uh Oh!! Some Error Occured!!");
  }
};
module.exports.searchBlog = async (req, res) => {
  const search = req.query.search;
  try {
    const blogs = await Blog.aggregate([
      {
        $match: {
          $or: [
            {
              title: new RegExp(search, "i"),
            },
            {
              tags: new RegExp(search, "i"),
            },
          ],
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
    res.status(200).send(blogs);
  } catch (e) {
    res.status(401).send("Some Error Occured");
  }
};
module.exports.updateTrending = async (req, res) => {
  const { title, user_id } = req.body;
  try {
    const existing = await Trending.findOne({
      blog_title: title,
    });
    if (existing) {
      var users = existing.users;
      var clicks = existing.clicks + 1;
      var newUsers = users.filter((user) => {
        if (user == user_id) clicks -= 1;
        // console.log(user, user_id);
        return user != user_id;
      });
      newUsers.push(user_id);
      const update = await Trending.updateOne(
        {
          blog_title: title,
        },
        {
          $set: {
            users: newUsers,
            clicks,
          },
        }
      );
    } else {
      const newBlogs = await Trending.create({
        blog_title: title,
        users: [user_id],
        clicks: 1,
      });
    }
    res.status(201).send("Updated Trending");
  } catch (e) {
    res.status(404).json("Some Error Occured!");
  }
};
module.exports.getTrending = async (req, res) => {
  try {
    const blogs = await Trending.aggregate([
      {
        $lookup: {
          from: "blogs",
          as: "blogs",
          let: { title: "$blog_title" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$title", "$$title"],
                },
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ],
        },
      },
    ]);
    var reducedBlogs = [];
    for (var i = 0; i < blogs.length; i++) {
      var cleanBlog = blogs[i]["blogs"][0];
      const user = await User.aggregate([
        {
          $match: {
            user_id: cleanBlog.author,
          },
        },
        {
          $project: {
            _id: 0,
            password: 0,
            __v: 0,
            token: 0,
          },
        },
      ]);
      cleanBlog["user_details"] = user;
      cleanBlog["clicks"] = blogs[i].clicks;
      reducedBlogs.push(cleanBlog);
    }
    reducedBlogs.sort(compare);
    reducedBlogs.reverse();
    res.status(200).send(reducedBlogs);
  } catch (e) {
    console.log(e);
    res.status(404).json("Some Error Occured");
  }
};
