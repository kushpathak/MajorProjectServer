const mongoose = require("mongoose");
const trendingSchema = new mongoose.Schema({
  blog_title: {
    type: String,
  },
  users: {
    type: Array,
  },
  clicks: {
    type: Number,
  },
});
const Trending = mongoose.model("trending", trendingSchema);
module.exports = Trending;
