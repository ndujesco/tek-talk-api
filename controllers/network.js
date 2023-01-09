const { isValidObjectId } = require("mongoose");
const Comment = require("../models/comment");
const Event = require("../models/event");
const History = require("../models/history");
const Post = require("../models/post");
const Talk = require("../models/talk");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");
const { extractEventsInfo } = require("./events");
const { extractCommentToSend } = require("./like-comment");
const { extractPostToSend } = require("./post-crud");
const { extractTalkInfo } = require("./talks");

exports.searchForAnything = async (req, res) => {
    const string = req.query.search
    const regexed = new RegExp(string, "i")
    const fromClick = req.query.click

    try {
        if (fromClick === "true") {}
        const users = await User.find();
        let usersToReturn = users.filter(user => regexed.test(user.username) || regexed.test(user.name) && user.id !== req.userId);
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

exports.saveSearch = async (req, res) => {
    let history;
    const string = req.body.search

    if (!string) return res.status(401).json({message: "Input a search"})
    // const theClass = req.body.class;
    try {
        history = await History.findOne({userId: req.userId})
        if (!history) {
            history = new History({
                userId: req.userId,
                history: []
            })
        }
        if (history.history.some(obj => obj.search.toLowerCase() === string.toLowerCase())) {
            const position = history.history.findIndex(obj => obj.search.toLowerCase() === string.toLowerCase())
            history.history.splice(position, 1)
        }  // remove so it can go up the array
        history.history.push({
            search: string
        })
        history.save();
        res.status(200).json({message: "Saved successfully!"});
    
    } catch (err) {
        catchError(err, res)
    }
}

exports.getSearchHistory = async (req, res) => {
    try {
        const history = await History.findOne({userId: req.userId}).sort({ $natural: -1 });;
        if (!history) return res.status(200).json({searchHistory: []});
    
        const search = history.history
        if (search.length === 0) return res.status(200).json({searchHistory: []});
        res.status(200).json({searchHistory: search.map(obj => {
            return {
                searchId: obj.id,
                search: obj.search
                }
            })
        });
    } catch (err) {
        catchError(err, res)
    }

}

exports.deleteSearch = async (req, res) => {
    const searchId = req.params.searchId
    if (!isValidObjectId(searchId)) return res.status(401).json({message: "Input valid id"})
    try {
        const history = await History.findOne({userId: req.userId});
        const position = history.history.findIndex(obj => obj.id === searchId)
        history.history.splice(position,1)
        history.save()
        res.status(200).json({message: "Deleted successfully!"})
    } catch (err) {
        catchError(err, res)
    }

}