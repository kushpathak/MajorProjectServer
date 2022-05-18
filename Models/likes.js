const mongoose = require("mongoose");
const likeSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  comment: {
    type: String,
  },
});
const Like = mongoose.model("like", likeSchema);
module.exports = Like;
