const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  blogTitle: {
    type: String,
    required: [true, "title is required"],
  },
  userId: {
    type: String,
  },
  comment: {
    type: String,
    required: [true, "Comment is required"],
  },
  likes: {
    type: Number,
    default: 0,
  },
});
const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;
