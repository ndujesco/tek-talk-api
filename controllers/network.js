const Comment = require("../models/comment")
const Event = require("../models/event")
const Post = require("../models/post")
const Talk = require("../models/talk")
const User = require("../models/user")
const { catchError } = require("../utils/help-functions")
const { extractEventsInfo } = require("./events")
const { extractCommentToSend } = require("./like-comment")
const { extractPostToSend } = require("./post-crud")
const { extractTalkInfo } = require("./talks")

exports.searchForAnything = async (req, res) => {
    const string = req.query.search
    const regexed = new RegExp(string, "i")
    const fromClick = req.query.click

    try {
        if (fromClick === "true") {}
        const users = await User.find();
        let usersToReturn = users.filter(user => regexed.test(user.username) || regexed.test(user.name));
        usersToReturn = usersToReturn.map(user=> {
           return {
            name: user.name,
            username: user.username,
            displayUrl: user.displayUrl || null
        }   
        })

        const comments = await Comment.find().populate("author");;
        let commentsToReturn = comments.filter(comment => regexed.test(comment.body));
        commentsToReturn = commentsToReturn.map(comment => extractCommentToSend(comment, users))
        commentsToReturn.reverse();

        const posts = await Post.find()
        .populate("author")
        .populate({ path: "comments", model: "Comment" });;
        let postsToReturn = posts.filter(post => regexed.test(post.body));
        postsToReturn = postsToReturn.map(post => extractPostToSend(post, users, req))

        const talks = await Talk.find().populate({ path: "users", model: "User" });
        let talksToReturn = talks.filter(talk => regexed.test(talk.name));
        talksToReturn = extractTalkInfo(talksToReturn, req.userId)

        const events = await Event.find()
        .populate({path: "attendees", model: "User" })
        .populate({path: "userId", model: "User" })
        let eventsToReturn = events.filter(event => regexed.test(event.name))
        eventsToReturn = extractEventsInfo(eventsToReturn, req.userId)

        res.status(200).json({
            users: usersToReturn, 
            comments: commentsToReturn, 
            posts: postsToReturn, 
            talks: talksToReturn,
            events: eventsToReturn
        })
        

    } catch (err) {
        catchError(err, res)
    }
}