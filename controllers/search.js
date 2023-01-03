const Comment = require("../models/comment")
const Post = require("../models/post")
const Talk = require("../models/talk")
const User = require("../models/user")
const { catchError } = require("../utils/help-functions")

exports.searchForAnything = async (req, res) => {
    const string = req.query.search
    const fromClick = req.query.click
    try {
        const comments = await Comment.find();
        // const commentsToReturn = comments.filter((comments) => )

    } catch (err) {
        catchError(err, res)
    }
}