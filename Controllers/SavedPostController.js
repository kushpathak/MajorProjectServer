const savedPosts = require("../Models/savedPost");
module.exports.getPosts = async (req, res) => {
  var userId = req.query.userId;
  try {
    const posts = await savedPosts.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $lookup: {
          from: "users",
          as: "user_details",
          let: { user_id: "$userId" },
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
      {
        $lookup: {
          from: "blogs",
          as: "blogs",
          let: { title: "$blogTitle" },
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
                __v: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          // blogTitle: 0,
          __v: 0,
        },
      },
    ]);
    res.status(200).send(posts);
  } catch (e) {
    res.status.send(e);
  }
};
module.exports.savePosts = async (req, res) => {
  var userId = req.body.userId;
  var blogTitle = req.body.blogTitle;
  try {
    const already = await savedPosts.findOne({
      userId,
      blogTitle,
    });
    if (already) {
      res.status(400).send("Blog Already Saved");
    } else {
      const post = await savedPosts.create({
        userId,
        blogTitle,
      });
      res.status(200).send("Saved Successfully!");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Some Erorr Occured");
  }
};
