const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: "Earth"
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
