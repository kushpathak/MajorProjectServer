const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: [true, "Title Is Required"],
  },
  author: {
    type: String,
    required: true,
  },
  tags: {
    type: String,
  },
  snippet: {
    type: String,
    required: [true, "Snippet is Required"],
  },
  image: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
  Comments: {
    type: Number,
    default: 0,
  },
});

const Blog = mongoose.model("blog", blogSchema);
module.exports = Blog;
