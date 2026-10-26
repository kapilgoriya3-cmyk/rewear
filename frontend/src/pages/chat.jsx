// ============================================================================
// ReWear — Chat / Negotiation Page (src/pages/chat.jsx)
// One-to-one clothing swap negotiation interface matching ReWear aesthetics
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import "./chat.css";
import API_BASE_URL from "../api";

// ReWear Authentic Item Assets
import denimJacketImg from "../assets/denimJacket.jpg";
import woolCoatImg from "../assets/woolCoat.jpg";

export default function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const messagesEndRef = useRef(null);

  // Component State (All hooks declared at top level)
  const [swapStatus, setSwapStatus] = useState("pending");
  const [swapRequest, setSwapRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputText, setInputText] = useState("");
  const [showSafetyTip, setShowSafetyTip] = useState(true);
  const [messages, setMessages] = useState([]);

  // Fetch Swap Request Data from Backend
  useEffect(() => {
    let isMounted = true;

    const fetchSwapRequest = async () => {
      if (!token) {
        if (isMounted) {
          setLoading(false);
          setError("Please log in to view this swap negotiation.");
        }
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/swaps/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!isMounted) return;

        if (!response.ok) {
          setError(data.message || "Failed to fetch swap request");
          return;
        }

        const req = data.swapRequest;
        setSwapRequest(req);
        setSwapStatus(req.status || "pending");

        // Fetch real messages for this swap
        const messagesResponse = await fetch(
          `${API_BASE_URL}/messages/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const messagesData = await messagesResponse.json();

        if (!messagesResponse.ok) {
          console.error(messagesData.message);
          return;
        }

        const currentUserId = user?.id || user?._id;

        const realMessages = messagesData.messages.map((msg) => {
          const senderId = msg.sender?._id || msg.sender;
          const isMe = String(senderId) === String(currentUserId);
          return {
            id: msg._id,
            sender: isMe ? "me" : "them",
            senderName: isMe ? "You" : msg.sender?.name || "User",
            avatar: isMe
              ? undefined
              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  msg.sender?.name || "User",
                )}`,
            text: msg.text,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setMessages(realMessages);
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch swap request:", err);
          setError("Failed to load swap request");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchSwapRequest();
    } else {
      if (isMounted) {
        setLoading(false);
        setError("No swap request selected. Please open a swap request from your profile to chat.");
      }
    }

    return () => {
      isMounted = false;
    };
  }, [id, token, user]);

  // Auto-scroll conversation to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Sending a Message (local UI only, message API to be added later)
const handleSendMessage = async (e) => {
  e?.preventDefault();

  const trimmed = inputText.trim();

  if (!trimmed) return;

  const currentUserId = user?.id || user?._id;

  const requesterId = swapRequest?.requester?._id || swapRequest?.requester;
  const receiverId =
    String(requesterId) === String(currentUserId)
      ? swapRequest?.receiver?._id || swapRequest?.receiver
      : swapRequest?.requester?._id || swapRequest?.requester;

  if (!receiverId) {
    toast.error("Receiver not found");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiver: receiverId,
        swapRequest: id,
        text: trimmed,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to send message");
      return;
    }

    const sentMessage = data.data;

    setMessages((prev) => [
      ...prev,
      {
        id: sentMessage._id,
        sender: "me",
        senderName: user?.name || "You",
        text: sentMessage.text,
        timestamp: new Date(sentMessage.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        readStatus: "Sent",
      },
    ]);

    setInputText("");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong while sending the message");
  }
};
  // Quick Negotiation Suggestions
  const quickSuggestions = [
    "📍 Thursday at 6:30 PM works great!",
    "📏 Can you confirm the pit-to-pit measurement?",
    "📦 Let’s use ReWear courier box",
    "📸 Could you share one more photo of the back hem?",
  ];

  const handleApplySuggestion = (suggestion) => {
    setInputText(suggestion);
  };

  // Handle Swap Acceptance
  const handleAcceptSwap = async () => {
    const shouldAccept = await confirm({
      title: "Accept Swap Proposal?",
      message:
        "Are you ready to accept this clothing swap? You can coordinate the meetup and handover details in chat.",
      confirmText: "Accept Swap",
      cancelText: "Cancel",
      type: "success",
    });
    if (!shouldAccept) return;

    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "accepted",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to accept swap");
        return;
      }

      setSwapStatus("accepted");
      toast.success(data.message || "Swap accepted successfully!");

      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          text: "🎉 Swap Accepted! Both swappers confirmed the exchange.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleRejectSwap = async () => {
    const shouldReject = await confirm({
      title: "Decline Swap Proposal?",
      message:
        "Are you sure you want to decline this swap proposal? This negotiation will be closed.",
      confirmText: "Decline Swap",
      cancelText: "Keep Proposal",
      isDestructive: true,
    });
    if (!shouldReject) return;

    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "rejected",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to reject swap");
        return;
      }

      setSwapStatus("rejected");
      setSwapRequest((prev) => ({ ...prev, status: "rejected" }));
      toast.info(data.message || "Swap request was declined.");

      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          text: "Swap request was rejected.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const [confirming, setConfirming] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const handleConfirmExchange = async () => {
    if (confirming) return;

    const shouldConfirm = await confirm({
      title: "Confirm Physical Handover?",
      message:
        "Have you received your item and completed the exchange with your swap partner? Both participants must confirm to finalize the swap.",
      confirmText: "Confirm Handover",
      cancelText: "Not yet",
      type: "info",
    });
    if (!shouldConfirm) return;

    setConfirming(true);
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${id}/confirm`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to confirm exchange");
        return;
      }

      toast.success(data.message);
      if (data.swapRequest) {
        setSwapRequest(data.swapRequest);
        setSwapStatus(data.swapRequest.status);

        if (data.swapRequest.status === "completed") {
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              type: "system",
              text: "🎉 Swap Completed! Both swappers confirmed the physical handover.",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              type: "system",
              text: "✓ You confirmed the physical exchange. Waiting for partner confirmation.",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setConfirming(false);
    }
  };

  // Build the swapData object dynamically from the real swapRequest
  const currentUserId = user?.id || user?._id;
  const isRequester = swapRequest
    ? String(swapRequest.requester?._id || swapRequest.requester) === String(currentUserId)
    : false;

  const userConfirmed = isRequester
    ? Boolean(swapRequest?.requesterConfirmed)
    : Boolean(swapRequest?.receiverConfirmed);

  const partnerConfirmed = isRequester
    ? Boolean(swapRequest?.receiverConfirmed)
    : Boolean(swapRequest?.requesterConfirmed);

  const partnerUser = swapRequest
    ? isRequester
      ? swapRequest.receiver
      : swapRequest.requester
    : null;

  const myItemObj = swapRequest
    ? isRequester
      ? swapRequest.offeredItem
      : swapRequest.requestedItem
    : null;

  const theirItemObj = swapRequest
    ? isRequester
      ? swapRequest.requestedItem
      : swapRequest.offeredItem
    : null;

  const partnerName = partnerUser?.name || "Swapper";
  const partnerAvatar =
    partnerUser?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partnerName)}`;

  const swapData = swapRequest
    ? {
        id: swapRequest._id,
        createdAt: new Date(swapRequest.createdAt).toLocaleString(),
        theirItem: {
          id: theirItemObj?._id,
          title: theirItemObj?.title || "Clothing Item",
          brand: theirItemObj?.brand || "Brand",
          size: theirItemObj?.size
            ? theirItemObj.size.startsWith("Size")
              ? theirItemObj.size
              : `Size ${theirItemObj.size}`
            : "Size M",
          condition: theirItemObj?.condition || "Good",
          estimatedValue: theirItemObj?.estimatedValue
            ? `₹${Number(theirItemObj.estimatedValue).toLocaleString('en-IN')}`
            : theirItemObj?.price
            ? `₹${Number(theirItemObj.price).toLocaleString('en-IN')}`
            : "Fair Swap",
          ownerName: partnerName,
          image: (Array.isArray(theirItemObj?.images) && theirItemObj.images[0]) || theirItemObj?.image || denimJacketImg,
        },
        myItem: {
          id: myItemObj?._id,
          title: myItemObj?.title || "Clothing Item",
          brand: myItemObj?.brand || "Brand",
          size: myItemObj?.size
            ? myItemObj.size.startsWith("Size")
              ? myItemObj.size
              : `Size ${myItemObj.size}`
            : "Size L",
          condition: myItemObj?.condition || "Good",
          estimatedValue: myItemObj?.estimatedValue
            ? `₹${Number(myItemObj.estimatedValue).toLocaleString('en-IN')}`
            : myItemObj?.price
            ? `₹${Number(myItemObj.price).toLocaleString('en-IN')}`
            : "Fair Swap",
          ownerName: "You",
          image: (Array.isArray(myItemObj?.images) && myItemObj.images[0]) || myItemObj?.image || woolCoatImg,
        },
        user: {
          name: partnerName,
          avatar: partnerAvatar,
          status: "Active now",
          reputation: "Verified Member",
          location: partnerUser?.location || "Indiranagar, Bengaluru",
        },
      }
    : null;

  // Loading & Error Guard (Safe after all hooks are evaluated)
  if (loading || !swapData) {
    return (
      <main className="negotiationPage">
        <div className="negTopBar">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="negBackBtn"
            title="Return to previous page"
          >
            ← Back to Swaps
          </button>
        </div>
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid var(--line)",
          }}
        >
          <p className="muted" style={{ fontSize: "15px" }}>
            {error || "Loading negotiation..."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="negotiationPage">
      {/* --- Top Bar & Breadcrumb Navigation --- */}
      <div className="negTopBar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="negBackBtn"
          title="Return to previous page"
        >
          ← Back to Swaps
        </button>

        <div className="negMetaInfo">
          <span className="negRefPill">Negotiation #{swapData.id}</span>
        </div>
      </div>

      <div className="negContainer">
        {/* ==================================================================== */}
        {/* COMPACT SWAP SUMMARY SECTION                                         */}
        {/* ==================================================================== */}
        <section
          className="swapSummaryCard"
          aria-label="Swap Negotiation Summary"
        >
          {/* Summary Header */}
          <div className="swapSummaryHeader">
            <div className="swapSummaryTitle">
              <span className="swapEyebrow">CLOTHING SWAP SUMMARY</span>
            </div>

            {/* Current Status Badge */}
            <div className={`statusBadge ${swapStatus}`}>
              <span className="statusDot" />
              {swapStatus === "pending" && "Pending Your Review"}
              {swapStatus === "accepted" && "Swap Accepted"}
              {swapStatus === "completed" && "Swap Completed"}
              {swapStatus === "rejected" && "Swap Request Declined"}
            </div>
          </div>

          {/* Two-Item Visual Comparison Grid */}
          <div className="swapItemsGrid">
            {/* Their Clothing Item */}
            <div className="swapItemBox">
              <img
                src={swapData.theirItem.image}
                alt={swapData.theirItem.title}
                className="swapItemImg"
              />
              <div className="swapItemDetails">
                <div className="swapItemParty">
                  Offered by {swapData.theirItem.ownerName}
                </div>
                <h3 className="swapItemTitle" title={swapData.theirItem.title}>
                  {swapData.theirItem.title}
                </h3>
                <div className="swapItemAttributes">
                  <span>{swapData.theirItem.brand}</span>
                  <span className="swapItemAttrDot">•</span>
                  <span>{swapData.theirItem.size}</span>
                  <span className="swapItemAttrDot">•</span>
                  <span>{swapData.theirItem.condition}</span>
                </div>
                <div className="swapItemValue">
                  Est. {swapData.theirItem.estimatedValue}
                </div>
              </div>
            </div>

            {/* Central Swap Connector */}
            <div className="swapConnector">
              <div
                className="swapIconCircle"
                title="1-to-1 Fair Wardrobe Exchange"
              >
                ↔
              </div>
              <span className="swapConnectorLabel">Direct Swap</span>
            </div>

            {/* My Clothing Item */}
            <div className="swapItemBox mySide">
              <img
                src={swapData.myItem.image}
                alt={swapData.myItem.title}
                className="swapItemImg"
              />
              <div className="swapItemDetails">
                <div className="swapItemParty mine">Your Wardrobe Item</div>
                <h3 className="swapItemTitle" title={swapData.myItem.title}>
                  {swapData.myItem.title}
                </h3>
                <div className="swapItemAttributes">
                  <span>{swapData.myItem.brand}</span>
                  <span className="swapItemAttrDot">•</span>
                  <span>{swapData.myItem.size}</span>
                  <span className="swapItemAttrDot">•</span>
                  <span>{swapData.myItem.condition}</span>
                </div>
                <div className="swapItemValue">
                  Est. {swapData.myItem.estimatedValue}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Footer with Dynamic Actions Based on Status */}
          <div className="swapSummaryFooter">
            {swapStatus === "pending" ? (
              isRequester ? (
                <div className="swapStatusNotice" style={{ width: "100%" }}>
                  <span className="swapStatusNoticeIcon">⏳</span>
                  <span>
                    Swap proposal sent! Waiting for <strong>{partnerName}</strong> to review and accept. You can chat below to coordinate meetup details.
                  </span>
                </div>
              ) : (
                <>
                  <div className="swapStatusNotice">
                    <span className="swapStatusNoticeIcon">⏳</span>
                    <span>
                      Negotiate terms, verify garment condition, and accept when
                      ready.
                    </span>
                  </div>

                  {/* Action Buttons for Receiver */}
                  <div className="swapActionButtons">
                    <button
                      type="button"
                      className="btnReject"
                      onClick={handleRejectSwap}
                      title="Decline this swap request"
                    >
                      Reject Swap
                    </button>
                    <button
                      type="button"
                      className="btnAccept"
                      onClick={handleAcceptSwap}
                      title="Accept this swap request"
                    >
                      Accept Swap
                    </button>
                  </div>
                </>
              )
            ) : swapStatus === "accepted" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div className="swapPostStatusBanner accepted">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <span>✓</span>
                    <span>
                      <strong>Swap Accepted!</strong> Coordinate the meetup details in the chat. Both participants must confirm after the physical exchange.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="swapChecklistBtn"
                    onClick={() => setShowChecklistModal(true)}
                  >
                    📋 Handover Checklist
                  </button>
                </div>

                {/* Two-User Physical Confirmation Row */}
                <div
                  style={{
                    background: "#f7f9f7",
                    border: "1px solid var(--line)",
                    borderRadius: "14px",
                    padding: "12px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "12px", color: "var(--ink)", marginBottom: "4px" }}>
                      EXCHANGE CONFIRMATION
                    </div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                      <span>
                        You:{" "}
                        <strong style={{ color: userConfirmed ? "var(--sage)" : "#854d0e" }}>
                          {userConfirmed ? "✓ Confirmed" : "⏳ Pending your confirmation"}
                        </strong>
                      </span>
                      <span>
                        {partnerName}:{" "}
                        <strong style={{ color: partnerConfirmed ? "var(--sage)" : "#854d0e" }}>
                          {partnerConfirmed ? "✓ Confirmed" : "⏳ Pending confirmation"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div>
                    {!userConfirmed ? (
                      <button
                        type="button"
                        className="btnAccept"
                        disabled={confirming}
                        onClick={handleConfirmExchange}
                        style={{ padding: "8px 16px", fontSize: "12px" }}
                        title="Confirm that you have physically received your item"
                      >
                        {confirming ? "Confirming..." : "🤝 Confirm Handover"}
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--sage)",
                          background: "var(--sage2)",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          display: "inline-block",
                        }}
                      >
                        ✓ Confirmed by You
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : swapStatus === "completed" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div className="swapPostStatusBanner accepted" style={{ color: "var(--sage)" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <span>🎉</span>
                    <span>
                      <strong>Swap Completed!</strong> Both participants have confirmed the physical exchange.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="swapChecklistBtn"
                    onClick={() => setShowChecklistModal(true)}
                  >
                    📋 View Checklist
                  </button>
                </div>

                <div
                  style={{
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "14px",
                    padding: "12px 18px",
                    fontSize: "12px",
                    color: "#0369a1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <span>
                    ✓ <strong>You confirmed</strong> · ✓ <strong>{partnerName} confirmed</strong>
                  </span>
                  <span style={{ fontWeight: 800 }}>Trade Successfully Finalized</span>
                </div>
              </div>
            ) : (
              <div className="swapPostStatusBanner rejected">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>✕</span>
                  <span>
                    <strong>Swap Declined.</strong> This negotiation is closed.
                    No items have been transferred.
                  </span>
                </div>
                <Link to="/browse" className="swapChecklistBtn">
                  Browse More Items
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* MAIN CHAT & CONVERSATION AREA                                       */}
        {/* ==================================================================== */}
        <section className="chatCard" aria-label="One-to-One Swap Conversation">
          {/* Chat Header */}
          <header className="chatHeader">
            <div className="chatUserMeta">
              <div className="avatarWrapper">
                <img
                  src={swapData.user.avatar}
                  alt={swapData.user.name}
                  className="chatAvatar"
                />
                <span className="onlineIndicatorDot" title="User is online" />
              </div>

              <div className="chatUserInfo">
                <div className="chatUserNameRow">
                  <span className="chatUserName">{swapData.user.name}</span>
                  <span className="verifiedBadge">Verified Swapper</span>
                </div>
                <div className="chatUserSub">
                  <span className="statusIndicatorText">● Active now</span>
                  <span>·</span>
                  <span>{swapData.user.reputation}</span>
                  <span>·</span>
                  <span>{swapData.user.location}</span>
                </div>
              </div>
            </div>

            <div className="chatHeaderActions">
              <Link
                to="/browse"
                className="chatHeaderBtn"
                title="View partner wardrobe"
              >
                Explore Wardrobe
              </Link>
              <button
                type="button"
                className="chatHeaderBtn"
                onClick={async () => {
                  await confirm({
                    title: "🛡️ Safe Swap Tips",
                    message: (
                      <ul
                        style={{
                          textAlign: "left",
                          margin: "12px 0 0",
                          paddingLeft: "20px",
                          lineHeight: "1.8",
                          fontSize: "13.5px",
                          color: "var(--ink-secondary)",
                        }}
                      >
                        <li>
                          <strong>Meet in public places:</strong> Metro stations, busy cafes, or university campuses.
                        </li>
                        <li>
                          <strong>Inspect in daylight:</strong> Check fabric, seams, zippers, and care tags.
                        </li>
                        <li>
                          <strong>Cashless barter:</strong> ReWear is a community wardrobe exchange; avoid monetary transactions.
                        </li>
                        <li>
                          <strong>Two-way confirmation:</strong> Confirm the handover on ReWear only after physically exchanging pieces.
                        </li>
                      </ul>
                    ),
                    confirmText: "Got it",
                    cancelText: "Close",
                    type: "info",
                  });
                }}
                title="Swap safety advice"
              >
                Safe Swap Tips
              </button>
            </div>
          </header>

          {/* Optional Sustainable Swap Safety Notice */}
          {showSafetyTip && (
            <div className="safetyNoticeBar">
              <div className="safetyNoticeText">
                <span>🛡️</span>
                <span>
                  <strong>ReWear Swap Safety:</strong> Inspect condition and
                  sizing during handover before concluding the trade.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyTip(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#7c4a03",
                }}
                title="Dismiss safety note"
              >
                ×
              </button>
            </div>
          )}

          {/* Conversation Stream */}
          <div className="messagesArea">
            <div className="dateDivider">
              <span className="dateDividerText">Today, October 6</span>
            </div>

            {messages.map((msg) => {
              if (msg.type === "system") {
                return (
                  <div key={msg.id} className="systemEventCard">
                    <span className="systemEventIcon">🌿</span>
                    <div>
                      <span>{msg.text}</span>
                      <div
                        style={{
                          fontSize: "10px",
                          marginTop: "3px",
                          opacity: 0.7,
                        }}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              }

              const isMe = msg.sender === "me";

              return (
                <div
                  key={msg.id}
                  className={`msgRow ${isMe ? "outgoing" : "incoming"}`}
                >
                  {!isMe && (
                    <img
                      src={msg.avatar}
                      alt={msg.senderName}
                      className="msgAvatar"
                    />
                  )}

                  <div className="msgBubbleContainer">
                    <div className="msgSenderName">
                      {isMe ? "You" : msg.senderName}
                    </div>

                    <div
                      className={`msgBubble ${isMe ? "outgoing" : "incoming"}`}
                    >
                      <p style={{ margin: 0 }}>{msg.text}</p>

                      {/* Optional Rich Attachment in Message */}
                      {msg.attachment && (
                        <div className="msgAttachmentCard">
                          <img
                            src={msg.attachment}
                            alt="Attachment preview"
                            className="msgAttachmentImg"
                          />
                          {msg.attachmentCaption && (
                            <div className="msgAttachmentCaption">
                              <span>{msg.attachmentCaption}</span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "var(--sage)",
                                }}
                              >
                                Verified
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="msgMeta">
                      <span>{msg.timestamp}</span>
                      {isMe && msg.readStatus && (
                        <span className="readReceipt" title={msg.readStatus}>
                          ✓✓ {msg.readStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Negotiation Suggestion Chips */}
          <div className="quickNegotiationBar">
            <span className="quickNegotiationLabel">Quick Prompts:</span>
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="quickNegotiationChip"
                onClick={() => handleApplySuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Message Composer */}
          <form className="composerForm" onSubmit={handleSendMessage}>
            <button
              type="button"
              className="composerActionBtn"
              title="Attach garment photo or measurement note"
              onClick={() => {
                toast.info(
                  "Photo attachments: You can upload photos of garments, tags, or measurements.",
                );
              }}
            >
              📷
            </button>

            <button
              type="button"
              className="composerActionBtn"
              title="Add location or meetup landmark"
              onClick={() => {
                setInputText((prev) =>
                  prev
                    ? `${prev} · Landmark: Indiranagar Metro`
                    : "Landmark: Indiranagar Metro",
                );
              }}
            >
              📍
            </button>

            <div className="composerInputWrapper">
              <input
                type="text"
                className="composerInput"
                placeholder="Ask about measurements, fabric, fit, or propose a meetup..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="composerSendBtn"
              disabled={!inputText.trim()}
              title="Send message"
            >
              Send <span>↑</span>
            </button>
          </form>
        </section>

        {/* Sustainable Wardrobe Environmental Footprint Footnote */}
        <div className="chatFooterReassurance">
          <span className="ecoLeafIcon">🌱</span>
          <span>
            Every completed clothing swap saves approximately{" "}
            <strong>14.2 kg of CO₂</strong> and keeps textiles out of landfills.
          </span>
        </div>
      </div>

      {/* Handover Checklist Modal */}
      {showChecklistModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowChecklistModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>📋 Handover Checklist</h3>
              <button
                type="button"
                onClick={() => setShowChecklistModal(false)}
                style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <p className="muted" style={{ fontSize: "13px", margin: "0 0 16px" }}>
              Follow these recommended steps during your physical meetup before confirming the swap:
            </p>
            <ul style={{ fontSize: "13px", lineHeight: "1.8", paddingLeft: "20px", margin: "0 0 20px", color: "var(--ink)" }}>
              <li>☀️ <strong>Inspect in daylight</strong>: Check garment condition, seams, zippers, and cleanliness.</li>
              <li>🏷️ <strong>Verify tags & sizing</strong>: Confirm brand label, size tag, and care instructions.</li>
              <li>🔒 <strong>Safety first</strong>: Always meet in public locations (e.g., cafes, metro stations).</li>
              <li>🤝 <strong>Two-way confirmation</strong>: Both participants confirm on ReWear once the handover takes place.</li>
            </ul>
            <button
              type="button"
              className="btn dark"
              style={{ width: "100%" }}
              onClick={() => setShowChecklistModal(false)}
            >
              Close Checklist
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
