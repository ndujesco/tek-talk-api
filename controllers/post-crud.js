const { body, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const fs = require("fs");

const Post = require("../models/post");

const {
  catchError,
  checkForMentionedUser,
} = require("../utils/help-functions");
const {
  uploadPostToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const User = require("../models/user");
const Comment = require("../models/comment");
const { notifyMention } = require("../utils/notifications");
const { Notification } = require("../models/notification");

const extractPostToSend = (post, users, req) => {
  const postToSend = {
    postId: post.id,
    authorId: post.author.id,
    username: post.author.username,
    authorImage: post.author.displayUrl,
    isVerified: post.author.verified,
    name: post.author.name,
    commentCount: post.comments.length,
    likeCount: post.likes.length,
    postedIn: post.postedIn,
    postBody: post.body,
    postDate: post.createdAt,
    images: [],
    isLiked: post.likes.includes(req.userId),
    mentions: checkForMentionedUser(post.body, users),
  };

  post.imagesLocal.forEach((img, index) => {
    const fileExists = fs.existsSync(img);

    if (fileExists) {
      postToSend.images.push("https://" + req.headers.host + "/" + img);
    } else {
      postToSend.images.push(post.imagesUrl[index]);
    }
  });
  return postToSend;
};

exports.postPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    const { body, postedIn } = req.body;
    const post = new Post({
      body,
      postedIn,
      author: req.userId,
      imagesLocal: [],
      imagesUrl: [],
      imagesId: [],
      comments: [],
      likes: [],
      createdAt: new Date().toString(),
    });
    const uploadedImages = req.files.image || []; //important

    uploadedImages.forEach((imgData) => {
      const imageLocalPath = imgData.path.replace("\\", "/");
      post.imagesLocal.push(imageLocalPath);
    });
    await post.save();
    res
      .status(200)
      .json({ status: 200, message: "Posted Successfully!", postId: post.id });

    notifyMention(body, req.userId, "post", post.id, "dummy", postedIn);

    uploadedImages.forEach((imgData) => {
      uploadPostToCloudinary(imgData.path, post.id);
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getPostsFromUserId = async (req, res) => {
  const id = req.params.id;
  const filter = req.query.filter;
  const pageNumber = +req.query.pageNumber || 1;
  const isValid = isValidObjectId(id);
  try {
    if (!id || !isValid) {
      return res.status(422).json({ status: 422, message: "Id is invalid" });
    }
    let posts = await Post.find({ author: id })
      .skip((pageNumber - 1) * 25)
      .limit(25)
      .populate("author")
      .populate({ path: "comments", model: "Comment" }) //so the comment count will always be accurate.
      .sort({ $natural: -1 });

    if (!posts) {
      return res.status(422).json({ status: 422, message: "Post not found" });
    }
    if (filter) {
      posts = posts.filter((post) => filter === post.postedIn);
    }
    let postsToSend = [];
    const users = await User.find();

    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, users, req);
      postsToSend.push(postToSend);
    });
    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getAllPosts = async (req, res) => {
  const filter = req.query.filter;
  const pageNumber = +req.query.pageNumber || 1;
  let posts;

  try {
    if (filter) {
      posts = await Post.find({postedIn: filter})
      .skip((pageNumber - 1) * 25)
      .limit(25)
      .populate({ path: "comments", model: "Comment" })
      .populate("author")
      .sort({ $natural: -1 });
      console.log(posts);
    }
    else {
      posts = await Post.find()
      .skip((pageNumber - 1) * 25)
      .limit(25)
      .populate({ path: "comments", model: "Comment" })
      .populate("author")
      .sort({ $natural: -1 });
    }
    let postsToSend = [];
    const users = await User.find();

    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, users, req);
      postsToSend.push(postToSend);
    });

    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getPostFromId = async (req, res) => {
  const postId = req.params.postId;
  const isValid = isValidObjectId(postId);

  if (!postId || !isValid) {
    return res.status(422).json({ status: 422, message: "Invalid post id" });
  }

  try {
    const post = await Post.findById(postId)
      .populate("author")
      .populate({ path: "comments", model: "Comment" });

    if (!post) {
      const error = new Error(
        "Errmm. postId does not exist again or never existed"
      );
      error.statusCode = 401;
      throw error;
    }
    const users = await User.find();

    const postToSend = extractPostToSend(post, users, req);
    res.status(200).json({ status: 200, post: [postToSend] });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getFeedOrNotUserName = async (req, res) => {
  const username = req.query.username;
  const bool = req.query.feed || false;
  const isFeed = bool === "true" ? true : false;
  const pageNumber = +req.query.pageNumber || 1;

  try {
    if (!username) {
      const error = new Error("username???");
      error.statusCode = 422;
      throw error;
    }
    const users = await User.find();
    const user = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (!user) {
      const error = new Error("Username Does not exist.");
      error.statusCode = 422;
      throw error;
    }
    const userId = user.id;
    let posts = await Post.find({ author: userId })
      .populate({ path: "comments", model: "Comment" })
      .populate("author")
      .skip((pageNumber - 1) * 25)
      .limit(25)
      .sort({ $natural: -1 });

    posts = posts.filter((post) =>
      post.postedIn === "Feed" ? isFeed : !isFeed
    );

    let postsToSend = [];

    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, users, req);
      postsToSend.push(postToSend);
    });

    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.deletePost = async (req, res) => {
  const { postId } = req.query;
  const isValid = isValidObjectId(postId);

  if (!isValid) {
    res.status(422).json({ status: 422, message: "This your id sha" });
  }

  try {
    const post = await Post.findByIdAndDelete(postId);
    await Comment.deleteMany({ post: postId });
    res.status(200).json({ message: "Deleted successfully" });
    post.imagesId.forEach((id) => {
      deleteFromCloudinary(id);
    });
    await Notification.deleteMany({ postId });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserRelatedPosts = async (req, res) => {
  const pageNumber = +req.query.pageNumber || 1;
  const isValid = isValidObjectId(req.userId);
  const start = (pageNumber - 1) * 25;
  const end = (pageNumber - 1) * 25 + 25;
  let loggedUser; // might not exist if user is not logged in

  try {
    let posts = await Post.find()
      .populate({ path: "comments", model: "Comment" })
      .populate("author")
      .sort({ $natural: -1 });

    if (isValid) {
      loggedUser = await User.findById(req.userId).populate({
        path: "talksId",
        model: "talk",
      }); // should've used capital t for consistenccy
    }

    if (loggedUser) {
      posts = posts.filter((post) => {
        const postedByAdmin =
          (post.author.id === "633b45a338ad34f4b8940219" ||
            post.author.id === "633dae0b84db7a1a751fe468") &&
          post.likes.length > 5;

        const followsPoster = loggedUser.following.includes(post.author.id);
        const postedInFeed = post.postedIn === "Feed";
        const postedByUser = post.author.id.toString() === req.userId;
        const inTalkPosted = loggedUser.talksId.some(
          (talk) => talk.name === post.postedIn
        );

        return (
          (followsPoster && postedInFeed) ||
          postedByUser ||
          postedByAdmin ||
          inTalkPosted
        );
      });
    }
    const users = await User.find();

    let postsToSend = [];
    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, users, req);
      postsToSend.push(postToSend);
    });

    const limPostToSend = postsToSend.slice(start, end);
    res.status(200).json({ status: 200, posts: limPostToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.extractPostToSend = extractPostToSend;
