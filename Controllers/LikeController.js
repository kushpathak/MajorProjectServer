const Like = require("../Models/likes");
module.exports.addLike = async (req, res) => {
  // console.log("here");
  const { user_id, comment } = req.body;
  try {
    const exist = await Like.find({
      user_id,
      comment,
    });
    var len = 1 - (exist.length > 0);
    if (exist.length) {
      const deleteLike = await Like.deleteOne({
        user_id,
        comment,
      });
    } else {
      const addLike = await Like.create({
        user_id,
        comment,
      });
    }

    res.status(200).send({
      likes: len,
    });
  } catch (e) {
    res.status(404).send("Some Error Occured");
  }
};
