const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, "Author is required"],
  },
  stars: {
    type: String,
    required: [true, "Rating is required"],
  },
  review: {
    type: String,
    required: [true, "Review is required"],
  },
});
const Review = mongoose.model("review", reviewSchema);
module.exports = Review;
