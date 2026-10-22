  const mongoose = require("mongoose");
  const Item = require("../models/item");
const cloudinary = require("../config/cloudinary");
  // Create a new listing
 
const createItem = async (req, res) => {
  try {
    const {
      title,
      brand,
      description,
      category,
      size,
      condition,
      image,
      images,
      location,
      estimatedValue,
    } = req.body;

    if (!title || !description || !category || !size || !condition) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const imageList = Array.isArray(images)
      ? images.filter((url) => typeof url === "string" && url.trim())
      : [];

    // Keep the first image in the old field for compatibility.
    const finalImages = imageList.length
      ? imageList
      : image
        ? [image]
        : [];

    const item = await Item.create({
      title,
      brand: brand || "",
      description,
      category,
      size,
      condition,
      image: finalImages[0] || "",
      images: finalImages,
      location: location || "Earth",
      estimatedValue: Number(estimatedValue) || 0,
      availability: "available",
      owner: req.user.userId,
    });

    return res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.error("Create item failed:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

  // Escape special regex characters safely
  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Get all items — supports ?search=, ?category=, ?condition=, ?location=
  const getItems = async (req, res) => {
    try {
      const { search, category, condition, location } = req.query;

      const filter = {};

      if (search && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        filter.$or = [
          { title: { $regex: safeSearch, $options: "i" } },
          { brand: { $regex: safeSearch, $options: "i" } },
          { category: { $regex: safeSearch, $options: "i" } },
          { description: { $regex: safeSearch, $options: "i" } },
        ];
      }

      if (category && category !== "All" && category.trim()) {
        filter.category = { $regex: escapeRegex(category.trim()), $options: "i" };
      }

      if (condition && condition !== "All" && condition.trim()) {
        filter.condition = { $regex: escapeRegex(condition.trim()), $options: "i" };
      }

      if (location && location !== "All" && location.trim()) {
        filter.location = { $regex: escapeRegex(location.trim()), $options: "i" };
      }

      const items = await Item.find(filter)
        .populate("owner", "name location")
        .sort({ createdAt: -1 });

      res.json({ items });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get a single item by ID
  const getItemById = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: "Item not found" });
      }

      const item = await Item.findById(req.params.id).populate(
        "owner",
        "name location email"
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json({ item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get all items belonging to the authenticated user
  const getMyItems = async (req, res) => {
    try {
      const items = await Item.find({ owner: req.user.userId }).sort({
        createdAt: -1,
      });

      res.json({ items });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Edit an existing listing — only the owner can edit
  const updateItem = async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.owner.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "You can only edit your own listings" });
      }

      const allowed = [
        "title",
        "brand",
        "description",
        "category",
        "size",
        "condition",
        "location",
        "image",
         "images",
        "availability",
        "estimatedValue",
      ];

      allowed.forEach((field) => {
        if (req.body[field] !== undefined) {
          item[field] = req.body[field];
        }
      });

      await item.save();

      res.json({ message: "Listing updated successfully", item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Delete a listing — only the owner can delete
  const deleteItem = async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.owner.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "You can only delete your own listings" });
      }

      await item.deleteOne();

      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };


const uploadItemImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image." });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rewear/items",
          resource_type: "image",
        },
        (error, uploadedImage) => {
          if (error) return reject(error);
          resolve(uploadedImage);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    return res.status(500).json({
      message: "Image upload failed. Please try again.",
    });
  }
};




  module.exports = {
    getItems,
    createItem,
    getItemById,
    getMyItems,
    updateItem,
    deleteItem,
     uploadItemImage,
  };