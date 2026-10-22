
const express = require("express");

const {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
  uploadItemImage,
} = require("../controllers/itemController");
const { toggleFavorite } = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// Handle file-validation errors cleanly
const handleImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "Invalid image upload.",
      });
    }

    next();
  });
};

// Specific routes first
router.get("/mine", authMiddleware, getMyItems);

// Public routes
router.get("/", getItems);
router.get("/:id", getItemById);

// Protected routes
router.post("/", authMiddleware, createItem);
router.post(
  "/upload-image",
  authMiddleware,
  handleImageUpload,
  uploadItemImage
);
router.post("/:id/like", authMiddleware, toggleFavorite);
router.patch("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);

module.exports = router;
