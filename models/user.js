const { Schema, Types, default: mongoose } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  bio: { type: String, default: null },
  verified: {
    type: Boolean,
    default: false,
  },
  followers: [{ type: String, required: true }],

  following: [
    {
      type: String,
      required: true,
    },
  ],

  github: { type: String, default: null },

  twitter: { type: String, default: null },

  instagram: { type: String, default: null },

  linkedIn: { type: String, default: null },

  token: String,

  tokenExpiration: Date,

  displayUrl: { type: String, default: null },

  displayLocal: { type: String, default: null },

  displayId: { type: String, default: null },

  backdropUrl: { type: String, default: null },

  backdropLocal: { type: String, default: null },

  backdropId: { type: String, default: null },

  talksId: [{ type: String }],

  searchHistory: [{ type: String }],
});

userSchema.methods.addToFollowers = function (id) {
  if (id === this.id) return;
  if (!this.followers.includes(id)) {
    this.followers.push(id);
  }
  return this.save();
};

userSchema.methods.addToFollowing = function (id) {
  if (id === this.id) return;
  if (!this.following.includes(id)) {
    this.following.push(id);
  }
  return this.save();
};

userSchema.methods.removeFollower = function (id) {
  const position = this.followers.indexOf(id);
  if (position > -1) this.followers.splice(position, 1);
  return this.save();
};

userSchema.methods.removeFollowing = function (id) {
  const position = this.following.indexOf(id);
  if (position > -1) this.following.splice(position, 1);
  return this.save();
};
module.exports = mongoose.model("User", userSchema);
