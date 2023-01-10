const { Schema, default: mongoose } = require("mongoose");

const eventSchema = new Schema({
    userId: {  //authorId I meant, my bad.
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
        default: null
    },

    imageLocal: {
        type: String,
    }, 

    imageId: {
        type: String,
    },

    location: {
        type: String,
    },

    startTime: {
        type: String,
    },

    endTime: {
        type: String,
    },

    attendees: [{
        type: String
    }]
})

module.exports = mongoose.model("Event", eventSchema)