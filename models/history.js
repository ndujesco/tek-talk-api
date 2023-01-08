const { Schema, default: mongoose } = require("mongoose");


const searchSchema = new Schema({
    class: String, // in casse we change our mind and want to make it more detailed
    search: String
})

const historySchema = new Schema({
    userId: {
        required: true,
        type: String
    },
    history: [searchSchema]
})
module.exports = mongoose.model("History", historySchema)