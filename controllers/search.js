const Comment = require("../models/comment")
const Post = require("../models/post")
const Talk = require("../models/talk")
const User = require("../models/user")
const { catchError } = require("../utils/help-functions")

exports.searchForAnything = async (req, res) => {
    const string = req.query.search
    const regexed = new RegExp(string)
    const fromClick = req.query.click

    try {
        const comments = await Comment.find();
        const commentsToReturn = comments.filter(comment => regexed.test(comment.body))

        const posts = await Post.find();
        const postsToReturn = posts.filter(post => regexed.test(post.body))

    } catch (err) {
        catchError(err, res)
    }
}