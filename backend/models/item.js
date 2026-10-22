const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    condition: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },
        images: {
      type: [String],
      default: [],
    },


    location: {
      type: String,
      default: "Earth",
    },

    availability: {
      type: String,
      enum: ["available", "pending", "unavailable"],
      default: "available",
    },

    estimatedValue: {
      type: Number,
      default: 0,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

module.exports = Item;
