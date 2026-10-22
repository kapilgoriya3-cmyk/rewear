const mongoose = require("mongoose");
const SwapRequest = require("../models/swapRequest");
const Item = require("../models/item");
const Notification = require("../models/notification");
const User = require("../models/user");

const createSwapRequest = async (req, res) => {
  try {
    const { requestedItem, offeredItem } = req.body;

    if (!requestedItem || !offeredItem) {
      return res.status(400).json({
        message: "Please select both items",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(requestedItem) ||
      !mongoose.Types.ObjectId.isValid(offeredItem)
    ) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const requested = await Item.findById(requestedItem);
    const offered = await Item.findById(offeredItem);

    if (!requested || !offered) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (requested.owner.toString() === req.user.userId) {
      return res.status(400).json({
        message: "You cannot request your own item",
      });
    }

    if (offered.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only offer your own item",
      });
    }

    const existingRequest = await SwapRequest.findOne({
      requester: req.user.userId,
      requestedItem,
      offeredItem,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Swap request already exists",
      });
    }

    const swapRequest = await SwapRequest.create({
      requester: req.user.userId,
      receiver: requested.owner,
      requestedItem,
      offeredItem,
    });

    try {
      const requesterUser = await User.findById(req.user.userId).select("name");
      await Notification.create({
        recipient: requested.owner,
        sender: req.user.userId,
        swapRequest: swapRequest._id,
        type: "swap_request",
        title: "New Swap Request",
        message: `${requesterUser?.name || "Someone"} sent you a swap request for "${requested.title}" offering "${offered.title}"`,
        link: "/profile?tab=incoming",
        isRead: false,
      });
    } catch (notifErr) {
      console.error("Error creating swap request notification:", notifErr);
    }

    res.status(201).json({
      message: "Swap request sent successfully",
      swapRequest,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getIncomingRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      receiver: req.user.userId,
    })
      .populate("requester", "name email")
      .populate("requestedItem")
      .populate("offeredItem")
      .sort({ createdAt: -1 });

    res.json({
      requests,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getOutgoingRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requester: req.user.userId,
    })
      .populate("receiver", "name email")
      .populate("requestedItem")
      .populate("offeredItem")
      .sort({ createdAt: -1 });

    res.json({
      requests,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateSwapRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Swap request not found",
      });
    }

    if (request.receiver.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only update requests sent to you",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This request has already been processed",
      });
    }

    request.status = status;

    await request.save();

    try {
      const responderUser = await User.findById(req.user.userId).select("name");
      const requestedItem = await Item.findById(request.requestedItem).select("title");
      const isAccepted = status === "accepted";

      await Notification.create({
        recipient: request.requester,
        sender: req.user.userId,
        swapRequest: request._id,
        type: isAccepted ? "swap_accepted" : "swap_rejected",
        title: isAccepted ? "Swap Request Accepted" : "Swap Request Declined",
        message: `${responderUser?.name || "The owner"} ${isAccepted ? "accepted" : "declined"} your swap request for "${requestedItem?.title || "your requested item"}"`,
        link: "/profile?tab=incoming",
        isRead: false,
      });
    } catch (notifErr) {
      console.error("Error creating swap status notification:", notifErr);
    }

    res.json({
      message: `Swap request ${status} successfully`,
      swapRequest: request,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSwapRequestById = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate("requester", "name email location")
      .populate("receiver", "name email location")
      .populate("requestedItem")
      .populate("offeredItem");

    if (!request) {
      return res.status(404).json({
        message: "Swap request not found",
      });
    }

    const userId = req.user.userId;

    if (
      request.requester._id.toString() !== userId &&
      request.receiver._id.toString() !== userId
    ) {
      return res.status(403).json({
        message: "You are not part of this swap",
      });
    }

    res.json({
      swapRequest: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const confirmSwapCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid swap request ID" });
    }

    const swap = await SwapRequest.findById(id)
      .populate("requester", "name email location")
      .populate("receiver", "name email location")
      .populate("requestedItem")
      .populate("offeredItem");

    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    const requesterId = swap.requester._id
      ? swap.requester._id.toString()
      : swap.requester.toString();
    const receiverId = swap.receiver._id
      ? swap.receiver._id.toString()
      : swap.receiver.toString();

    // Only participants can confirm
    if (requesterId !== userId && receiverId !== userId) {
      return res.status(403).json({ message: "You are not a participant in this swap" });
    }

    // Verify swap state
    if (swap.status === "rejected") {
      return res.status(400).json({ message: "Rejected swaps cannot be completed" });
    }
    if (swap.status === "cancelled") {
      return res.status(400).json({ message: "Cancelled swaps cannot be completed" });
    }
    if (swap.status === "pending") {
      return res.status(400).json({ message: "Swap request must be accepted before confirming exchange" });
    }
    if (swap.status === "completed") {
      return res.status(400).json({ message: "Swap has already been completed" });
    }
    if (swap.status !== "accepted") {
      return res.status(400).json({ message: "Invalid swap status for completion" });
    }

    const isRequester = requesterId === userId;

    // Prevent duplicate confirmations
    if (isRequester && swap.requesterConfirmed) {
      return res.status(400).json({ message: "You have already confirmed this swap" });
    }
    if (!isRequester && swap.receiverConfirmed) {
      return res.status(400).json({ message: "You have already confirmed this swap" });
    }

    // Record confirmation
    if (isRequester) {
      swap.requesterConfirmed = true;
    } else {
      swap.receiverConfirmed = true;
    }

    const bothConfirmed = swap.requesterConfirmed && swap.receiverConfirmed;
    if (bothConfirmed) {
      swap.status = "completed";
      if (swap.requestedItem) {
        await Item.findByIdAndUpdate(swap.requestedItem._id || swap.requestedItem, {
          availability: "unavailable",
        });
      }
      if (swap.offeredItem) {
        await Item.findByIdAndUpdate(swap.offeredItem._id || swap.offeredItem, {
          availability: "unavailable",
        });
      }
    } else {
      swap.status = "accepted";
    }

    await swap.save();

    // Create notifications
    try {
      const actorName = isRequester ? swap.requester.name : swap.receiver.name;
      const partnerId = isRequester ? receiverId : requesterId;

      if (bothConfirmed) {
        await Notification.create({
          recipient: partnerId,
          sender: userId,
          swapRequest: swap._id,
          type: "swap_completed",
          title: "Swap Completed! 🎉",
          message: `${actorName} confirmed the exchange. Both members confirmed — this swap is completed!`,
          link: `/chat/${swap._id}`,
          isRead: false,
        });
        await Notification.create({
          recipient: userId,
          sender: partnerId,
          swapRequest: swap._id,
          type: "swap_completed",
          title: "Swap Completed! 🎉",
          message: `Both swappers confirmed the physical exchange. Your swap is successfully completed!`,
          link: `/chat/${swap._id}`,
          isRead: false,
        });
      } else {
        await Notification.create({
          recipient: partnerId,
          sender: userId,
          swapRequest: swap._id,
          type: "swap_confirmed",
          title: "Exchange Confirmed",
          message: `${actorName} confirmed the physical handover. Please confirm when you have also received your item!`,
          link: `/chat/${swap._id}`,
          isRead: false,
        });
      }
    } catch (notifErr) {
      console.error("Error creating swap confirmation notification:", notifErr);
    }

    res.json({
      message: bothConfirmed
        ? "Swap completed successfully! Both participants confirmed."
        : "Exchange confirmed! Waiting for partner to confirm.",
      swapRequest: swap,
    });
  } catch (error) {
    console.error("Error in confirmSwapCompletion:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSwapRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateSwapRequestStatus,
  getSwapRequestById,
  confirmSwapCompletion,
};