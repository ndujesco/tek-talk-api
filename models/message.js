const { Schema, default: mongoose } = require("mongoose");

const messageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },

    senderId: {
      type: String,
      required: true,
    },

    receiverId: {
      type: String,
      required: true,
    },

    imagesUrl: [
      {
        type: String,
      },
    ],

    imagesId: [
      {
        type: String,
      },
    ],
    imagesLocal: [
      {
        type: String,
      },
    ],

    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
