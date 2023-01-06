const Comment = require("../models/comment")
const Post = require("../models/post")
const Talk = require("../models/talk")
const User = require("../models/user")
const { catchError } = require("../utils/help-functions")
const { extractTalkInfo } = require("./talks")

exports.searchForAnything = async (req, res) => {
    const string = req.query.search
    const regexed = new RegExp(string)
    const fromClick = req.query.click

    try {
        if (fromClick === "true") {}
        const users = await User.find();
        let usersToReturn = users.filter(user => regexed.test(user.username) || regexed.test(user.name));
        usersToReturn.map(user=> {
           return {
            name: user.name,
            username: user.username,
            displayUrl: user.displayUrl || null
        }   
        })

        const comments = await Comment.find();
        const commentsToReturn = comments.filter(comment => regexed.test(comment.body));

        const posts = await Post.find();
        let postsToReturn = posts.filter(post => regexed.test(post.body));

        const talks = await Talk.find().populate({ path: "users", model: "User" });
        let talksToReturn = talks.filter(talk => regexed.test(talk.name));
        talksToReturn = extractTalkInfo(talksToReturn, req.userId)
        

    } catch (err) {
        catchError(err, res)
    }
}