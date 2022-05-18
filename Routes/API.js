const express = require("express");
const router = express.Router();
const BlogController = require("../Controllers/BlogController");
const CommentController = require("../Controllers/CommentController");
const userController = require("../Controllers/UserController");
const SavedPostController = require("../Controllers/SavedPostController");
const LikeController = require("../Controllers/LikeController");
const { requireAuth } = require("../Middlewares/authController");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/users");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
let upload = multer({ storage: storage });
let uploadProfile = multer({ storage: profileStorage });
router.post("/add-comment", requireAuth, CommentController.commentAdd);
router.post(
  "/add-blog",
  requireAuth,
  upload.single("photo"),
  BlogController.blogAdd
);

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/save-post", requireAuth, SavedPostController.savePosts);
router.post("/logout", userController.logout);
router.post("/update-user", requireAuth, userController.updateUserDetails);
router.post(
  "/update-image",
  requireAuth,
  uploadProfile.single("photo"),
  userController.updateProfile
);
router.post("/add-like", requireAuth, LikeController.addLike);
router.post("/update-trending", BlogController.updateTrending);
router.post("/update-preferences", requireAuth, userController.updateFrequency);
router.get("/get-suggestions", userController.getSuggestions);
router.get("/get-trending", BlogController.getTrending);
router.get("/get-save-posts", SavedPostController.getPosts);
router.get("/get-profile", requireAuth, userController.getProfile);
router.get("/status", requireAuth, userController.status);
router.get("/user-profile", requireAuth, userController.getUserInfo);
router.get("/get-blogs", BlogController.blogGetAll);
router.get("/get-blog", BlogController.blogGetOne);
router.get("/get-len", BlogController.getBlogCount);
router.get("/get-blog-one", BlogController.blogGetTitle);
router.get("/search-blog", BlogController.searchBlog);
router.get("/get-comment", CommentController.commentGet);
module.exports = router;
