// ============================================================================
// ReWear — Profile & Dashboard Page (src/pages/profile.jsx)
// My Listings (with image cards), Edit Profile, Swap Management, Accurate Stats
// ============================================================================

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

import denimJacketImg from "../assets/denimJacket.jpg";
import floralDressImg from "../assets/floralDress.jpg";
import greenHoodieImg from "../assets/greenHoodie.jpg";
import leatherBackpackImg from "../assets/leatherBackpack.jpg";
import blackTopImg from "../assets/blackTop.jpg";

const API = "http://localhost:5000/api";

function getImageForCategory(category, title) {
  const cat = (category || "").toLowerCase();
  const t = (title || "").toLowerCase();
  if (cat.includes("dress") || t.includes("dress") || t.includes("zara"))
    return floralDressImg;
  if (cat.includes("top") || t.includes("top") || cat.includes("shirt"))
    return blackTopImg;
  if (cat.includes("hoodie") || t.includes("hoodie")) return greenHoodieImg;
  if (cat.includes("bag") || t.includes("bag") || cat.includes("shoe"))
    return leatherBackpackImg;
  return denimJacketImg;
}

function Profile() {
  const { user, logout, token, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Swap requests state
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [outgoingLoading, setOutgoingLoading] = useState(true);

  // My Listings state
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");


  // Edit listing state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Edit Profile modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({
    type: "",
    message: "",
  });

  // Active tab
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "listings";
  });

  // Sync activeTab when query param or location state changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab") || location.state?.tab;
    if (tabParam === "saved") {
      navigate("/saved", { replace: true });
      return;
    }
    if (
      tabParam &&
      ["listings", "incoming", "outgoing", "history"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [location.search, location.state, navigate]);

  // Initialize edit profile fields when user loads or modal opens
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileLocation(user.location || "");
    }
  }, [user, isEditProfileOpen]);

  // Fetch incoming swap requests
  const fetchIncoming = async () => {
    if (!token) return;
    setRequestsLoading(true);
    try {
      const res = await fetch(`${API}/swaps/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data) ? data : data.requests || [];
        setIncomingRequests(list);
      }
    } catch (e) {
      console.error("fetchIncoming error:", e);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchIncoming();
  }, [token]);

  // Fetch outgoing swap requests
  const fetchOutgoing = async () => {
    if (!token) return;
    setOutgoingLoading(true);
    try {
      const res = await fetch(`${API}/swaps/outgoing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data) ? data : data.requests || [];
        setOutgoingRequests(list);
      }
    } catch (e) {
      console.error("fetchOutgoing error:", e);
    } finally {
      setOutgoingLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOutgoing();
  }, [token]);

  // Fetch my listings
  const fetchMyListings = async () => {
    if (!token) return;
    setListingsLoading(true);
    setListingsError("");
    try {
      const res = await fetch(`${API}/items/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data) ? data : data.items || [];
        setMyListings(list);
      } else {
        setListingsError(data.message || "Failed to load listings");
      }
    } catch (e) {
      console.error("fetchMyListings error:", e);
      setListingsError("Could not load listings. Please verify connection.");
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyListings();
  }, [token]);

  // Accept / Reject swap request
  const handleRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${API}/swaps/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update request");
        return;
      }
      alert(data.message);
      setIncomingRequests((prev) =>
        prev.map((r) =>
          r._id === requestId ? { ...r, status: data.swapRequest.status } : r,
        ),
      );
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    }
  };

  // Open edit listing form
  const openEdit = (item) => {
    setEditingItem(item._id);
    setEditForm({
      title: item.title || "",
      brand: item.brand || "",
      category: item.category || "",
      size: item.size || "",
      condition: item.condition || "",
      location: item.location || "",
      description: item.description || "",
      availability: item.availability || "available",
      estimatedValue: item.estimatedValue || 0,
    });
    setEditError("");
  };

  // Submit edit listing form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`${API}/items/${editingItem}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.message || "Failed to update listing");
        return;
      }
      setMyListings((prev) =>
        prev.map((item) => (item._id === editingItem ? data.item : item)),
      );
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      setEditError("Something went wrong while saving changes");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete listing
  const handleDelete = async (itemId) => {
    if (
      !window.confirm(
        "Delete this listing? This piece will be removed from the community wardrobe.",
      )
    )
      return;
    try {
      const res = await fetch(`${API}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete listing");
        return;
      }
      setMyListings((prev) => prev.filter((item) => item._id !== itemId));
    } catch (e) {
      console.error(e);
      alert("Something went wrong deleting the listing");
    }
  };

  // Handle Edit Profile submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileFeedback({ type: "", message: "" });

    if (!profileName.trim() || profileName.trim().length < 2) {
      setProfileFeedback({
        type: "error",
        message: "Name must be at least 2 characters long.",
      });
      return;
    }

    setProfileSaving(true);
    try {
      const res = await updateProfile({
        name: profileName.trim(),
        location: profileLocation.trim() || "Earth",
      });

      if (res.success) {
        setProfileFeedback({
          type: "success",
          message: "Profile updated successfully!",
        });
        setTimeout(() => {
          setIsEditProfileOpen(false);
          setProfileFeedback({ type: "", message: "" });
        }, 1200);
      } else {
        setProfileFeedback({
          type: "error",
          message: res.error || "Failed to update profile.",
        });
      }
    } catch (err) {
      console.error(err);
      setProfileFeedback({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Availability badge styling
  const availBadge = (status) => {
    const styles = {
      available: {
        background: "var(--sage2)",
        color: "var(--sage)",
        border: "1px solid rgba(23, 107, 77, 0.2)",
      },
      pending: {
        background: "var(--amber-bg)",
        color: "var(--amber)",
        border: "1px solid var(--amber-border)",
      },
      unavailable: {
        background: "var(--rose-bg)",
        color: "var(--rose)",
        border: "1px solid var(--rose-border)",
      },
    };
    return styles[status] || styles.available;
  };

  // Accurate Dashboard Statistics
  const activeListingsCount = myListings.filter(
    (i) => i.availability === "available",
  ).length;

  const pendingOffersCount = incomingRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const acceptedSwapsCount = [...incomingRequests, ...outgoingRequests].filter(
    (r) => r.status === "accepted" || r.status === "completed",
  ).length;

  const totalItemsCount = myListings.length;

  const swapHistory = [
    ...incomingRequests.map((r) => ({ ...r, role: "receiver" })),
    ...outgoingRequests.map((r) => ({ ...r, role: "requester" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!user) {
    return (
      <main className="page-container">
        <div
          className="auth"
          style={{ textAlign: "center", maxWidth: "480px" }}
        >
          <div className="logo">
            re<span>wear</span>.
          </div>
          <h1 style={{ fontSize: "28px" }}>Sign in to view Profile</h1>
          <p className="muted" style={{ margin: "12px 0 24px" }}>
            Join our conscious community to manage your listings, track trades,
            and swap pre-loved fashion.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Link
              to="/login"
              className="btn dark"
              style={{ textAlign: "center" }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="btn light"
              style={{ textAlign: "center" }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const tabs = [
    {
      key: "listings",
      label: "My Listings",
      count: totalItemsCount,
      icon: "📦",
    },
    {
      key: "incoming",
      label: "Incoming Requests",
      count: incomingRequests.length,
      icon: "📥",
    },
    {
      key: "outgoing",
      label: "My Requests",
      count: outgoingRequests.length,
      icon: "📤",
    },
    {
      key: "history",
      label: "Swap History",
      count: swapHistory.length,
      icon: "📋",
    },
  ];

  return (
    <main className="page-container">
      <div className="profile">
        {/* Sidebar */}
        <aside className="profileSide">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "User")}`}
            alt={user.name}
          />
          <h2 style={{ fontSize: "20px", margin: "0 0 4px" }}>{user.name}</h2>
          <p className="muted" style={{ fontSize: "13px", margin: "0 0 12px" }}>
            {user.email}
          </p>
          <span className="pill" style={{ marginBottom: "16px" }}>
            Verified Member
          </span>

          {/* Edit Profile Entry Point */}
          <div>
            <button
              type="button"
              className="btn light"
              onClick={() => setIsEditProfileOpen(true)}
              style={{
                width: "100%",
                padding: "8px 14px",
                fontSize: "12.5px",
                fontWeight: 700,
              }}
            >
              ✏️ Edit Profile
            </button>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              marginTop: "16px",
              textAlign: "left",
            }}
          >
            <p
              className="muted"
              style={{ fontSize: "12.5px", margin: "6px 0" }}
            >
              📍 <strong>Location:</strong> {user.location || "Earth"}
            </p>
            <p
              className="muted"
              style={{ fontSize: "12.5px", margin: "6px 0" }}
            >
              🌱 <strong>Sustainability Score:</strong>{" "}
              {acceptedSwapsCount * 30 + activeListingsCount * 10} pts
            </p>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "var(--r-md)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: activeTab === tab.key ? 800 : 600,
                  background:
                    activeTab === tab.key ? "var(--sage2)" : "transparent",
                  color: activeTab === tab.key ? "var(--sage)" : "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "var(--transition)",
                }}
              >
                <span>
                  {tab.icon} {tab.label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 7px",
                    borderRadius: "var(--r-full)",
                    background:
                      activeTab === tab.key ? "var(--sage)" : "var(--line)",
                    color: activeTab === tab.key ? "#fff" : "var(--muted)",
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Naturally integrated logout */}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "18px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              className="btn light"
              style={{
                width: "100%",
                borderColor: "var(--rose-border)",
                color: "var(--rose)",
                fontSize: "12.5px",
              }}
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Log out of your ReWear account"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <div className="profileContent">
          {/* Stats Banner Header */}
          <div className="profileTop">
            <span className="eyebrow">YOUR DASHBOARD</span>
            <h1 style={{ fontSize: "32px", margin: "6px 0 10px" }}>
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="muted" style={{ maxWidth: "600px", margin: 0 }}>
              Real-time snapshot of your wardrobe exchanges, active pieces, and
              trade requests.
            </p>

            <div className="profileStats">
              <div className="miniStat">
                <b>{activeListingsCount}</b>
                <span>Active Listings</span>
              </div>
              <div className="miniStat">
                <b>{pendingOffersCount}</b>
                <span>Pending Offers</span>
              </div>
              <div className="miniStat">
                <b>{acceptedSwapsCount}</b>
                <span>Accepted Swaps</span>
              </div>
              <div className="miniStat">
                <b>{totalItemsCount}</b>
                <span>Total Items</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/additem"
                className="btn dark"
                style={{ padding: "10px 18px", fontSize: "13px" }}
              >
                ＋ List a Piece
              </Link>
              <Link
                to="/browse"
                className="btn light"
                style={{ padding: "10px 18px", fontSize: "13px" }}
              >
                Explore Community Wardrobe
              </Link>
            </div>
          </div>

          {/* TAB 1: MY LISTINGS (With Actual Listing Cards) */}
          {activeTab === "listings" && (
            <div className="panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <span className="eyebrow">MY WARDROBE</span>
                  <h2 style={{ margin: "4px 0 0", fontSize: "22px" }}>
                    Your Listed Clothing Pieces
                  </h2>
                </div>
                <Link
                  to="/additem"
                  className="btn dark"
                  style={{ padding: "8px 16px", fontSize: "12px" }}
                >
                  ＋ Add New Listing
                </Link>
              </div>

              {listingsLoading && (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-block",
                      width: "32px",
                      height: "32px",
                      border: "3px solid var(--line)",
                      borderTopColor: "var(--sage)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <p
                    className="muted"
                    style={{ marginTop: "12px", fontSize: "13.5px" }}
                  >
                    Loading your listings…
                  </p>
                </div>
              )}

              {listingsError && (
                <div
                  style={{
                    padding: "20px",
                    background: "var(--rose-bg)",
                    borderRadius: "var(--r-md)",
                    border: "1px solid var(--rose-border)",
                    margin: "16px 0",
                  }}
                >
                  <p
                    style={{ color: "var(--rose)", margin: 0, fontWeight: 700 }}
                  >
                    {listingsError}
                  </p>
                  <button
                    type="button"
                    className="btn light"
                    onClick={fetchMyListings}
                    style={{ marginTop: "10px", fontSize: "12px" }}
                  >
                    Retry Loading
                  </button>
                </div>
              )}

              {!listingsLoading &&
                !listingsError &&
                myListings.length === 0 && (
                  <div style={{ padding: "48px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>
                      👗
                    </div>
                    <h3 style={{ fontSize: "19px", marginBottom: "6px" }}>
                      You have no listings yet.
                    </h3>
                    <p
                      className="muted"
                      style={{
                        fontSize: "13.5px",
                        maxWidth: "420px",
                        margin: "0 auto 20px",
                      }}
                    >
                      You haven’t listed any pieces yet. Give an unworn garment
                      in your wardrobe a new life and begin swapping!
                    </p>
                    <Link to="/additem" className="btn dark">
                      ＋ Create Your First Listing
                    </Link>
                  </div>
                )}

              {!listingsLoading && myListings.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {myListings.map((item) => {
                    const itemImg =
                      item.image && item.image.trim() !== ""
                        ? item.image
                        : Array.isArray(item.images) &&
                            item.images.length > 0 &&
                            item.images[0]
                          ? item.images[0]
                          : getImageForCategory(item.category, item.title);

                    return (
                      <div
                        key={item._id}
                        style={{
                          background: "var(--paper)",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--r-lg)",
                          padding: "16px",
                          transition: "var(--transition)",
                        }}
                      >
                        {/* Inline Edit Form */}
                        {editingItem === item._id ? (
                          <div
                            style={{
                              background: "var(--white)",
                              padding: "20px",
                              borderRadius: "var(--r-md)",
                              border: "1px solid var(--line)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "14px",
                              }}
                            >
                              <strong>Editing Piece: {item.title}</strong>
                              <button
                                type="button"
                                className="btn light"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "12px",
                                }}
                                onClick={() => setEditingItem(null)}
                              >
                                ✕ Cancel
                              </button>
                            </div>

                            {editError && (
                              <p
                                style={{
                                  color: "var(--rose)",
                                  fontSize: "13px",
                                  marginBottom: "10px",
                                }}
                              >
                                {editError}
                              </p>
                            )}

                            <form onSubmit={handleEditSubmit}>
                              <div
                                className="formGrid"
                                style={{ marginTop: "4px" }}
                              >
                                <div className="field">
                                  <label>TITLE</label>
                                  <input
                                    value={editForm.title}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        title: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="field">
                                  <label>BRAND</label>
                                  <input
                                    value={editForm.brand}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        brand: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="field">
                                  <label>LOCATION</label>
                                  <input
                                    value={editForm.location}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        location: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="field">
                                  <label>ESTIMATED SWAP VALUE (₹)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={editForm.estimatedValue}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        estimatedValue: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                                <div className="field">
                                  <label>CATEGORY</label>
                                  <select
                                    value={editForm.category}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        category: e.target.value,
                                      })
                                    }
                                  >
                                    {[
                                      "Jacket",
                                      "Dress",
                                      "Top",
                                      "Shoes",
                                      "Bag",
                                      "Hoodie",
                                      "Pants",
                                      "Shirt",
                                      "Other",
                                    ].map((c) => (
                                      <option key={c}>{c}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="field">
                                  <label>SIZE</label>
                                  <select
                                    value={editForm.size}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        size: e.target.value,
                                      })
                                    }
                                  >
                                    {[
                                      "XS",
                                      "S",
                                      "M",
                                      "L",
                                      "XL",
                                      "XXL",
                                      "One size",
                                    ].map((s) => (
                                      <option key={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="field">
                                  <label>CONDITION</label>
                                  <select
                                    value={editForm.condition}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        condition: e.target.value,
                                      })
                                    }
                                  >
                                    {["Like new", "Good", "Fair"].map((c) => (
                                      <option key={c}>{c}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="field">
                                  <label>AVAILABILITY STATUS</label>
                                  <select
                                    value={editForm.availability}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        availability: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="available">
                                      Available for Swap
                                    </option>
                                    <option value="pending">
                                      Pending Swap
                                    </option>
                                    <option value="unavailable">
                                      Unavailable / Swapped
                                    </option>
                                  </select>
                                </div>
                                <div className="field full">
                                  <label>DESCRIPTION</label>
                                  <textarea
                                    rows="3"
                                    value={editForm.description}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        description: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  marginTop: "16px",
                                }}
                              >
                                <button
                                  type="submit"
                                  className="btn dark"
                                  style={{
                                    padding: "9px 18px",
                                    fontSize: "13px",
                                  }}
                                  disabled={editLoading}
                                >
                                  {editLoading ? "Saving…" : "Save Changes"}
                                </button>
                                <button
                                  type="button"
                                  className="btn light"
                                  style={{
                                    padding: "9px 18px",
                                    fontSize: "13px",
                                  }}
                                  onClick={() => setEditingItem(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          /* Visual Listing Card */
                          <div
                            style={{
                              display: "flex",
                              gap: "18px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            {/* Item Photo */}
                            <img
                              src={itemImg}
                              alt={item.title}
                              style={{
                                width: "90px",
                                height: "90px",
                                objectFit: "cover",
                                borderRadius: "var(--r-md)",
                                border: "1px solid var(--line)",
                                flexShrink: 0,
                                background: "#fff",
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getImageForCategory(
                                  item.category,
                                  item.title,
                                );
                              }}
                            />

                            {/* Item Details */}
                            <div style={{ flex: 1, minWidth: "220px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                  marginBottom: "4px",
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize: "16px",
                                    color: "var(--ink)",
                                  }}
                                >
                                  {item.title}
                                </strong>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    borderRadius: "var(--r-full)",
                                    fontWeight: 800,
                                    textTransform: "capitalize",
                                    ...availBadge(
                                      item.availability || "available",
                                    ),
                                  }}
                                >
                                  {item.availability || "available"}
                                </span>
                              </div>

                              <p
                                className="muted"
                                style={{ fontSize: "13px", margin: "2px 0" }}
                              >
                                {item.brand && (
                                  <span>
                                    <strong>{item.brand}</strong> ·{" "}
                                  </span>
                                )}
                                {item.category} · Size {item.size} ·{" "}
                                {item.condition}
                              </p>

                              <p
                                className="muted"
                                style={{ fontSize: "12px", margin: "2px 0" }}
                              >
                                📍 {item.location || "Location not specified"}
                              </p>

                              <p
                                style={{
                                  fontSize: "13px",
                                  margin: "4px 0 0",
                                  color: "var(--sage)",
                                  fontWeight: 800,
                                }}
                              >
                                Est. Swap Value: ₹
                                {(item.estimatedValue || 0).toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                            </div>

                            {/* Card Actions */}
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexShrink: 0,
                                flexWrap: "wrap",
                              }}
                            >
                              <Link
                                to={`/itemdetail/${item._id}`}
                                className="btn light"
                                style={{
                                  padding: "8px 14px",
                                  fontSize: "12px",
                                }}
                              >
                                👁 View Details
                              </Link>
                              <button
                                type="button"
                                className="btn light"
                                style={{
                                  padding: "8px 14px",
                                  fontSize: "12px",
                                }}
                                onClick={() => openEdit(item)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className="btn light"
                                style={{
                                  padding: "8px 14px",
                                  fontSize: "12px",
                                  borderColor: "var(--rose-border)",
                                  color: "var(--rose)",
                                }}
                                onClick={() => handleDelete(item._id)}
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* TAB 2: INCOMING REQUESTS */}
          {activeTab === "incoming" && (
            <div className="panel">
              <div style={{ marginBottom: "18px" }}>
                <span className="eyebrow">SWAP OFFERS RECEIVED</span>
                <h2 style={{ margin: "4px 0 0", fontSize: "22px" }}>
                  Incoming Swap Proposals
                </h2>
              </div>

              {requestsLoading && (
                <p
                  className="muted"
                  style={{ padding: "20px 0", textAlign: "center" }}
                >
                  Loading requests…
                </p>
              )}

              {!requestsLoading && incomingRequests.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                    📥
                  </div>
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                    No incoming requests.
                  </h3>
                  <p className="muted" style={{ fontSize: "13.5px" }}>
                    When other community members propose a swap for your pieces,
                    their offers appear here.
                  </p>
                </div>
              )}

              {!requestsLoading &&
                incomingRequests.map((request) => (
                  <div
                    key={request._id}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      padding: "18px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "15px" }}>
                          {request.requester?.name || "Community Member"} wants
                          to swap
                        </strong>
                        <p
                          className="muted"
                          style={{ fontSize: "13.5px", margin: "6px 0 2px" }}
                        >
                          Offered:{" "}
                          <strong>
                            {request.offeredItem?.title || "Offered Item"}
                          </strong>{" "}
                          (₹{request.offeredItem?.estimatedValue || 0})
                        </p>
                        <p
                          className="muted"
                          style={{ fontSize: "13.5px", margin: "2px 0 6px" }}
                        >
                          For your:{" "}
                          <strong>
                            {request.requestedItem?.title || "Your Item"}
                          </strong>{" "}
                          (₹{request.requestedItem?.estimatedValue || 0})
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "6px",
                          }}
                        >
                          <span className="status">
                            Status: {request.status}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {request.status === "pending" && (
                          <>
                            <button
                              type="button"
                              className="btn green"
                              style={{ padding: "7px 14px", fontSize: "12px" }}
                              onClick={() =>
                                handleRequestStatus(request._id, "accepted")
                              }
                            >
                              ✓ Accept Swap
                            </button>
                            <button
                              type="button"
                              className="btn light"
                              style={{
                                padding: "7px 14px",
                                fontSize: "12px",
                                borderColor: "var(--rose-border)",
                                color: "var(--rose)",
                              }}
                              onClick={() =>
                                handleRequestStatus(request._id, "rejected")
                              }
                            >
                              ✕ Decline
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn light"
                          style={{ padding: "7px 14px", fontSize: "12px" }}
                          onClick={() => navigate(`/chat/${request._id}`)}
                        >
                          💬 Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 3: OUTGOING REQUESTS */}
          {activeTab === "outgoing" && (
            <div className="panel">
              <div style={{ marginBottom: "18px" }}>
                <span className="eyebrow">MY PROPOSALS</span>
                <h2 style={{ margin: "4px 0 0", fontSize: "22px" }}>
                  Requests You Sent
                </h2>
              </div>

              {outgoingLoading && (
                <p
                  className="muted"
                  style={{ padding: "20px 0", textAlign: "center" }}
                >
                  Loading your requests…
                </p>
              )}

              {!outgoingLoading && outgoingRequests.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                    📤
                  </div>
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                    No outgoing swap requests.
                  </h3>
                  <p
                    className="muted"
                    style={{ fontSize: "13.5px", marginBottom: "16px" }}
                  >
                    Explore the community wardrobe and request a piece you love.
                  </p>
                  <Link to="/browse" className="btn dark">
                    Explore Wardrobe
                  </Link>
                </div>
              )}

              {!outgoingLoading &&
                outgoingRequests.map((request) => (
                  <div
                    key={request._id}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      padding: "18px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "15px" }}>
                          You requested a swap
                        </strong>
                        <p
                          className="muted"
                          style={{ fontSize: "13.5px", margin: "6px 0 2px" }}
                        >
                          You offered:{" "}
                          <strong>
                            {request.offeredItem?.title || "Item"}
                          </strong>
                        </p>
                        <p
                          className="muted"
                          style={{ fontSize: "13.5px", margin: "2px 0 6px" }}
                        >
                          Target piece:{" "}
                          <strong>
                            {request.requestedItem?.title || "Target item"}
                          </strong>
                        </p>
                        <p
                          className="muted"
                          style={{ fontSize: "12px", margin: "2px 0 0" }}
                        >
                          To owner:{" "}
                          <strong>
                            {request.receiver?.name || "Community Member"}
                          </strong>
                        </p>
                        <div style={{ marginTop: "6px" }}>
                          <span className="status">
                            Status: {request.status}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn light"
                        style={{ padding: "7px 14px", fontSize: "12px" }}
                        onClick={() => navigate(`/chat/${request._id}`)}
                      >
                        💬 Message
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 4: SWAP HISTORY */}
          {activeTab === "history" && (
            <div className="panel">
              <div style={{ marginBottom: "18px" }}>
                <span className="eyebrow">ACTIVITY LOG</span>
                <h2 style={{ margin: "4px 0 0", fontSize: "22px" }}>
                  Complete Swap History
                </h2>
              </div>

              {(requestsLoading || outgoingLoading) && (
                <p
                  className="muted"
                  style={{ padding: "20px 0", textAlign: "center" }}
                >
                  Loading history…
                </p>
              )}

              {!requestsLoading &&
                !outgoingLoading &&
                swapHistory.length === 0 && (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                      📋
                    </div>
                    <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                      No swap history recorded yet.
                    </h3>
                    <p
                      className="muted"
                      style={{ fontSize: "13.5px", marginBottom: "16px" }}
                    >
                      Once you send or accept trades, all your transactions will
                      be preserved here.
                    </p>
                    <Link to="/browse" className="btn dark">
                      Start Swapping
                    </Link>
                  </div>
                )}

              {!requestsLoading &&
                !outgoingLoading &&
                swapHistory.map((request) => {
                  const isRequester = request.role === "requester";
                  const myItem = isRequester
                    ? request.offeredItem
                    : request.requestedItem;
                  const theirItem = isRequester
                    ? request.requestedItem
                    : request.offeredItem;
                  const otherUser = isRequester
                    ? request.receiver
                    : request.requester;

                  return (
                    <div
                      key={request._id + request.role}
                      style={{
                        borderBottom: "1px solid var(--line)",
                        padding: "16px 0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <strong style={{ fontSize: "14.5px" }}>
                            {myItem?.title || "My item"} ↔{" "}
                            {theirItem?.title || "Their item"}
                          </strong>
                          <span className="status">{request.status}</span>
                        </div>
                        <p
                          className="muted"
                          style={{ fontSize: "12.5px", margin: "4px 0 2px" }}
                        >
                          {isRequester ? "You requested from" : "Requested by"}{" "}
                          <strong>
                            {otherUser?.name || "Community Member"}
                          </strong>
                        </p>
                        <p
                          className="muted"
                          style={{ fontSize: "11.5px", margin: "2px 0 0" }}
                        >
                          {new Date(request.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn light"
                        style={{ padding: "7px 14px", fontSize: "12px" }}
                        onClick={() => navigate(`/chat/${request._id}`)}
                      >
                        💬 Chat Log
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditProfileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(23, 26, 24, 0.72)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setIsEditProfileOpen(false)}
        >
          <div
            className="panel"
            style={{
              maxWidth: "480px",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              borderRadius: "var(--r-xl)",
              padding: "32px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "22px", margin: 0 }}>Edit Your Profile</h2>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p
              className="muted"
              style={{ fontSize: "13px", marginBottom: "20px" }}
            >
              Update your display name and location to help nearby swappers
              connect with you.
            </p>

            {profileFeedback.message && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--r-md)",
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: 650,
                  background:
                    profileFeedback.type === "error"
                      ? "var(--rose-bg)"
                      : "var(--sage2-soft)",
                  color:
                    profileFeedback.type === "error"
                      ? "var(--rose)"
                      : "var(--sage)",
                  border: `1px solid ${profileFeedback.type === "error" ? "var(--rose-border)" : "rgba(23, 107, 77, 0.2)"}`,
                }}
              >
                {profileFeedback.message}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="field">
                <label htmlFor="edit-profile-name">FULL NAME</label>
                <input
                  id="edit-profile-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="edit-profile-email">
                  EMAIL ADDRESS (CANNOT BE CHANGED)
                </label>
                <input
                  id="edit-profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  style={{
                    background: "#f5f4ef",
                    color: "var(--muted)",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              <div className="field">
                <label htmlFor="edit-profile-location">LOCATION</label>
                <input
                  id="edit-profile-location"
                  type="text"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  placeholder="e.g. Ahmedabad, Gujarat"
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  className="btn light"
                  style={{ flex: 1 }}
                  onClick={() => setIsEditProfileOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn dark"
                  style={{ flex: 1.4 }}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;
