  const express = require("express");

const {
  createSwapRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateSwapRequestStatus,
    getSwapRequestById,
  confirmSwapCompletion,
} = require("../controllers/swapRequestController");

  const authMiddleware = require("../middleware/authMiddleware");

  const router = express.Router();

  router.post("/", authMiddleware, createSwapRequest);

  router.get("/incoming", authMiddleware, getIncomingRequests);

  router.get("/outgoing", authMiddleware, getOutgoingRequests);
  router.get("/:id", authMiddleware, getSwapRequestById);
  router.patch("/:id", authMiddleware, updateSwapRequestStatus);
  router.patch("/:id/confirm", authMiddleware, confirmSwapCompletion);



  module.exports = router;