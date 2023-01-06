const { Schema, default: mongoose } = require("mongoose");

const eventSchema = new Schema({
    userId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    imageUrl: {
        type: String,
    },

    imageLocal: {
        type: String,
    }, 

    imageId: {
        type: String,
    },

    date: {
        type: String,
        required: true
    },
    attendees: [{
        type: String
    }]
})

module.exports = mongoose.model("Event", eventSchema)