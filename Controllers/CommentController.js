const Comment = require("../Models/comments");
const ErrorHandler = (error) => {
  //   console.log(Object.keys(error.errors));
  const Error = {
    blogTitle: "",
    user: "",
    comment: "",
  };
  Object.values(error.errors).forEach((error) => {
    Error[error.properties.path] = error.properties.message;
  });
  return Error;
};
module.exports.commentAdd = async (req, res) => {
  const { blogTitle, userId, comment } = req.body;
  // console.log(comment);
  console.log(userId);
  try {
    const comment_ = await Comment.create({
      blogTitle,
      userId,
      comment,
    });

    res.status(201).json(comment_);
  } catch (e) {
    // console.log(e);
    const Error = ErrorHandler(e);
    res.status(401).json(Error);
  }
};
module.exports.commentGet = async (req, res) => {
  try {
    const param = req.query.blogTitle;
    const result = await Comment.aggregate([
      {
        $match: {
          blogTitle: param,
        },
      },

      {
        $lookup: {
          from: "users",
          as: "users",
          let: { author: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$user_id", "$$author"],
                },
              },
            },
            {
              $project: {
                password: 0,
                email: 0,
                user_id: 0,
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
          from: "likes",
          as: "likes",
          let: { comment: "$comment" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$comment", "$$comment"],
                },
              },
            },
          ],
        },
      },
    ]);

    res.status(201).send(result);
  } catch (e) {
    console.log(e);
    res.status(401).send("Cant Fetch Comments!! Please try again!");
  }
};
