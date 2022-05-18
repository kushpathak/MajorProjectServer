const mongoose = require("mongoose");
const frequentSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  tags: {
    type: Array,
  },
});
const Frequent = mongoose.model("frequent", frequentSchema);
module.exports = Frequent;
