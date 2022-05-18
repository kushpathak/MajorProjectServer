const mongoose = require("mongoose");
const SavedPostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User Id is Required"],
  },
  blogTitle: {
    type: String,
    required: [true, "Blog Title Is Required"],
  },
});
const SavedPost = mongoose.model("savedPost", SavedPostSchema);
module.exports = SavedPost;
