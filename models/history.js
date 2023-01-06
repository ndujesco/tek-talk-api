const { Schema, default: mongoose } = require("mongoose");

const historySchema = new Schema({
    userId: {
        required: true,
        type: String
    },
    history: [{
        type: String
    }]
})

module.exports = mongoose.model("History", historySchema)