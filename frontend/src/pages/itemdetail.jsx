// ============================================================================
// ReWear — Item Detail Page (src/pages/itemdetail.jsx)
// Premium fashion product page with vertical thumbnail gallery,
// pale sage estimated value panel, and wardrobe swap modal.
// ============================================================================

import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import API_BASE_URL from "../api";
import denimJacketImg from "../assets/denimJacket.jpg";
import floralDressImg from "../assets/floralDress.jpg";
import greenHoodieImg from "../assets/greenHoodie.jpg";
import leatherBackpackImg from "../assets/leatherBackpack.jpg";
import blackTopImg from "../assets/blackTop.jpg";

function getImageForCategory(category, title) {
  const cat = (category || "").toLowerCase();
  const t = (title || "").toLowerCase();
  if (cat.includes("dress") || t.includes("dress") || t.includes("zara")) return floralDressImg;
  if (cat.includes("top") || t.includes("top") || cat.includes("shirt")) return blackTopImg;
  if (cat.includes("hoodie") || t.includes("hoodie")) return greenHoodieImg;
  if (cat.includes("bag") || t.includes("bag") || cat.includes("shoe")) return leatherBackpackImg;
  return denimJacketImg;
}

function getValidGalleryImages(item) {
  if (!item) return [];

  // Support multi-image listings from images array
  if (Array.isArray(item.images)) {
    const validUrls = item.images.filter(
      (img) => typeof img === "string" && img.trim() !== ""
    );
    if (validUrls.length > 0) {
      return validUrls;
    }
  }

  // Fallback to single image field
  if (typeof item.image === "string" && item.image.trim() !== "") {
    return [item.image.trim()];
  }

  // Graceful fallback to category/title placeholder
  return [getImageForCategory(item.category, item.title)];
}

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { isFavorited, toggleFavorite, isProcessing } = useFavorites();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isSaved = isFavorited(id);
  const processing = isProcessing(id);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const touchStartX = useRef(null);
  const thumbsRef = useRef(null);

  // Swap offer state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [selectedOfferedId, setSelectedOfferedId] = useState("");
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapSent, setSwapSent] = useState(false);
  const [loadingMyItems, setLoadingMyItems] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load item");
          return;
        }

        setItem(data.item);
        setSelectedImageIndex(0);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const galleryImages = getValidGalleryImages(item);
  const safeIndex =
    selectedImageIndex >= 0 && selectedImageIndex < galleryImages.length
      ? selectedImageIndex
      : 0;
  const currentImage =
    galleryImages[safeIndex] || getImageForCategory(item?.category, item?.title);

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleGalleryKeyDown = (e) => {
    if (galleryImages.length <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrevImage();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNextImage();
    }
  };

  const handleTouchStart = (e) => {
    if (galleryImages.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (galleryImages.length <= 1 || touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (thumbsRef.current && thumbsRef.current.children[safeIndex]) {
      const activeThumb = thumbsRef.current.children[safeIndex];
      if (typeof activeThumb.scrollIntoView === "function") {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [safeIndex]);

  const handleOpenSwapModal = async () => {
    if (!token) {
      alert("Please log in to request a swap.");
      navigate("/login");
      return;
    }

    const currentUserId = user?.id || user?._id;
    const itemOwnerId = item?.owner?._id || item?.owner;
    if (currentUserId && itemOwnerId && String(currentUserId) === String(itemOwnerId)) {
      alert("This is your own listing. You cannot swap with yourself.");
      return;
    }

    setLoadingMyItems(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to load your wardrobe items.");
        return;
      }

      const availableItems = (data.items || []).filter(
        (i) => i.availability !== "unavailable"
      );

      if (availableItems.length === 0) {
        if (
          window.confirm(
            "You have no available items in your wardrobe to offer for this swap.\n\nWould you like to list an item now?"
          )
        ) {
          navigate("/additem");
        }
        return;
      }

      setMyItems(availableItems);
      setSelectedOfferedId(availableItems[0]._id);
      setShowSwapModal(true);
    } catch (err) {
      console.error(err);
      alert("Could not load your wardrobe items. Please try again.");
    } finally {
      setLoadingMyItems(false);
    }
  };

  const handleConfirmSwap = async (e) => {
    e.preventDefault();
    if (!selectedOfferedId) {
      alert("Please select an item from your wardrobe to offer.");
      return;
    }

    setSwapLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/swaps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestedItem: item._id,
          offeredItem: selectedOfferedId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to send swap request");
        return;
      }

      setSwapSent(true);
      setShowSwapModal(false);
      alert("Swap request sent successfully! You can track this swap in your Profile.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while sending swap request.");
    } finally {
      setSwapLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-container" style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ display: "inline-block", width: "36px", height: "36px", border: "3px solid var(--line)", borderTopColor: "var(--sage)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p className="muted" style={{ marginTop: "16px" }}>Loading piece details...</p>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="page-container" style={{ textAlign: "center", padding: "80px 0" }}>
        <h2>{error || "Item not found"}</h2>
        <p className="muted" style={{ maxWidth: "400px", margin: "10px auto 20px" }}>
          The item may have been removed or already swapped by another member.
        </p>
        <Link to="/browse" className="btn dark">
          ← Back to Explore
        </Link>
      </main>
    );
  }

  const selectedOfferedItem = myItems.find(i => i._id === selectedOfferedId);
  const isAvailable = !item.availability || item.availability === "available";

  return (
    <main className="page-container">
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/browse"
          className="muted"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 650 }}
        >
          <span>←</span> Back to wardrobe
        </Link>
      </div>

      <div className="detail">
        {/* Left Side: Desktop Vertical Gallery + Main Viewer */}
        <div className="detailGallery">
          <div className="galleryDesktopLayout">
            {/* Vertical Thumbnails on Desktop / Horizontal on Mobile */}
            {galleryImages.length > 1 && (
              <div
                ref={thumbsRef}
                className="galleryThumbs galleryThumbsVertical"
                role="tablist"
                aria-label="Item image thumbnails"
              >
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={safeIndex === idx}
                    aria-label={`View image ${idx + 1} of ${galleryImages.length}`}
                    className={`galleryThumbBtn ${safeIndex === idx ? "active" : ""}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      className="galleryThumbImg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getImageForCategory(
                          item.category,
                          item.title
                        );
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Photo */}
            <div
              className="galleryMain"
              tabIndex={galleryImages.length > 1 ? 0 : undefined}
              onKeyDown={handleGalleryKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-label={`${item.title} image viewer`}
            >
              <img
                src={currentImage}
                alt={`${item.title} - View ${safeIndex + 1}`}
                className="galleryMainImg"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getImageForCategory(
                    item.category,
                    item.title
                  );
                }}
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="galleryNavBtn prev"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    title="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="galleryNavBtn next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                    title="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <div className="galleryCounter" aria-live="polite">
                    {safeIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Product Information Panel */}
        <div className="detailPanel">
          <div className="eyebrow">
            {item.category || "Garment"} · 📍 {item.location || "Community"}
          </div>

          <h1 style={{ margin: "10px 0 8px", fontSize: "36px", letterSpacing: "-1px" }}>
            {item.title}
          </h1>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "18px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
              {item.brand || "Vintage / Unbranded"}
            </span>
            <span style={{ color: "var(--line-strong)" }}>•</span>
            <span className="pill">Size: {item.size || "Free"}</span>
            <span className="pill" style={{ background: "#f3f1eb", color: "var(--ink)" }}>
              Condition: {item.condition || "Pre-loved"}
            </span>
            {item.color && (
              <span className="pill" style={{ background: "#f3f1eb", color: "var(--ink)" }}>
                Color: {item.color}
              </span>
            )}
          </div>

          {/* Pale Sage Estimated Swap Value Box */}
          <div className="valueBox">
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--sage)" }}>
                Fair-Exchange Valuation
              </div>
              <div className="bigPrice">
                {item.estimatedValue > 0
                  ? `₹${item.estimatedValue.toLocaleString("en-IN")}`
                  : "Fair Value Match"}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "4px" }}>
                Suggested swap balance · No cash is exchanged
              </div>
            </div>
            <div style={{ fontSize: "28px", color: "var(--sage)", opacity: 0.85 }}>
              ↔
            </div>
          </div>

          {/* Description */}
          <h3 style={{ fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            About the piece
          </h3>
          <p className="muted" style={{ fontSize: "14px", lineHeight: "1.65", marginBottom: "24px" }}>
            {item.description || "No additional description provided by owner."}
          </p>

          {/* Owner Profile Card */}
          <div className="owner">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                item.owner?.name || "User"
              )}`}
              alt={item.owner?.name}
            />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: "14.5px" }}>{item.owner?.name || "Community Member"}</b>
              <div className="muted" style={{ fontSize: "12px", marginTop: "2px" }}>
                📍 {item.owner?.location || item.location || "Location not specified"}
              </div>
            </div>
            <span className="pill">Verified Swapper</span>
          </div>

          {/* Availability Alert if not available */}
          {!isAvailable && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "var(--r-md)",
                background: item.availability === "pending" ? "var(--amber-bg)" : "var(--rose-bg)",
                color: item.availability === "pending" ? "var(--amber)" : "var(--rose)",
                fontSize: "13px",
                fontWeight: 700,
                border: `1px solid ${item.availability === "pending" ? "var(--amber-border)" : "var(--rose-border)"}`,
              }}
            >
              ⚠️ This item is currently <strong>{item.availability}</strong> and cannot be requested right now.
            </div>
          )}

          {/* Call to Action Buttons */}
          <div className="heroActions" style={{ marginTop: "24px", marginBottom: 0 }}>
            <button
              type="button"
              onClick={() => toggleFavorite(id)}
              disabled={processing}
              className={`btn ${isSaved ? "btn-outline-sage" : "light"}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 18px",
                borderRadius: "var(--r-md)",
                border: isSaved ? "1.5px solid var(--sage)" : "1px solid var(--border)",
                background: isSaved ? "var(--sage2)" : "var(--white)",
                color: isSaved ? "var(--sage)" : "var(--ink)",
                fontWeight: 700,
                fontSize: "13.5px",
                cursor: "pointer",
                transition: "var(--transition)",
              }}
              title={isSaved ? "Remove from saved pieces" : "Save piece to favorites"}
              aria-label={isSaved ? "Remove from saved pieces" : "Save piece to favorites"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!token) {
                  alert("Please log in to message the owner.");
                  navigate("/login");
                  return;
                }
                const currentUserId = user?.id || user?._id;
                const itemOwnerId = item?.owner?._id || item?.owner;
                if (currentUserId && itemOwnerId && String(currentUserId) === String(itemOwnerId)) {
                  alert("This is your own listing.");
                  return;
                }
                alert("To message the owner and negotiate an exchange, please propose a swap first.");
                handleOpenSwapModal();
              }}
              className="btn light"
              style={{ flex: 1 }}
            >
              💬 Message Owner
            </button>
            <button
              type="button"
              onClick={handleOpenSwapModal}
              className="btn dark"
              style={{ flex: 1.2 }}
              disabled={
                !isAvailable ||
                swapSent ||
                loadingMyItems
              }
              title={!isAvailable ? "This item is not available" : ""}
            >
              {swapSent
                ? "✓ Swap Requested"
                : loadingMyItems
                ? "Checking Wardrobe…"
                : "Request Swap →"}
            </button>
          </div>
        </div>
      </div>

      {/* Propose Swap Wardrobe Modal */}
      {showSwapModal && (
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
          onClick={() => setShowSwapModal(false)}
        >
          <div
            className="panel"
            style={{
              maxWidth: "520px",
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
                marginBottom: "18px",
              }}
            >
              <h2 style={{ fontSize: "22px", margin: 0 }}>Propose an Item Swap</h2>
              <button
                type="button"
                onClick={() => setShowSwapModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: "0 4px",
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="muted" style={{ fontSize: "13.5px", marginBottom: "20px" }}>
              Select a piece from your wardrobe to offer in exchange for <strong>{item.title}</strong>:
            </p>

            <form onSubmit={handleConfirmSwap}>
              <div className="field">
                <label htmlFor="select-offered-item">YOUR OFFERED PIECE</label>
                <select
                  id="select-offered-item"
                  value={selectedOfferedId}
                  onChange={(e) => setSelectedOfferedId(e.target.value)}
                  required
                  style={{ fontWeight: 600, padding: "12px" }}
                >
                  {myItems.map((myItem) => (
                    <option key={myItem._id} value={myItem._id}>
                      {myItem.title} ({myItem.brand || "Vintage"} · ₹{myItem.estimatedValue || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Valuation Comparison Preview */}
              {selectedOfferedItem && (
                <div
                  style={{
                    background: "var(--sage2-soft)",
                    borderRadius: "var(--r-md)",
                    padding: "16px",
                    margin: "18px 0",
                    border: "1px solid rgba(23, 107, 77, 0.15)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700 }}>
                    <span>Your piece: ₹{selectedOfferedItem.estimatedValue || 0}</span>
                    <span style={{ color: "var(--sage)" }}>↔</span>
                    <span>Requested: ₹{item.estimatedValue || 0}</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "6px" }}>
                    {Math.abs((selectedOfferedItem.estimatedValue || 0) - (item.estimatedValue || 0)) <= 300
                      ? "✨ Excellent fair balance match!"
                      : "Fair exchange: You and the owner can discuss details in direct chat."}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  className="btn light"
                  style={{ flex: 1 }}
                  onClick={() => setShowSwapModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn dark"
                  style={{ flex: 1.4 }}
                  disabled={swapLoading}
                >
                  {swapLoading ? "Sending Offer…" : "Send Swap Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default ItemDetail;
