import { useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import denimJacketImg from "../assets/denimJacket.jpg";
import floralDressImg from "../assets/floralDress.jpg";
import greenHoodieImg from "../assets/greenHoodie.jpg";
import leatherBackpackImg from "../assets/leatherBackpack.jpg";
import blackTopImg from "../assets/blackTop.jpg";

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

function ClothingCard({ item }) {
  const { isFavorited, toggleFavorite, isProcessing } = useFavorites();
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  const itemId = item._id || item.id;
  const isSaved = isFavorited(itemId);
  const processing = isProcessing(itemId);
  const title = item.title || "Untitled Piece";
  const brand = item.brand || "Vintage / Unbranded";
  const size = item.size || "";
  const condition = item.condition || "";
  const location = item.location || "Local community";

  // Format estimated value
  const rawValue = item.estimatedValue || item.price;
  const formattedValue =
    typeof rawValue === "number"
      ? `₹${rawValue.toLocaleString("en-IN")}`
      : typeof rawValue === "string" && rawValue.startsWith("₹")
        ? rawValue
        : rawValue
          ? `₹${rawValue}`
          : null;

  // Determine image source
  let rawImage = "";
  if (
    Array.isArray(item.images) &&
    item.images.length > 0 &&
    typeof item.images[0] === "string" &&
    item.images[0].trim() !== ""
  ) {
    rawImage = item.images[0].trim();
  } else if (typeof item.image === "string" && item.image.trim() !== "") {
    rawImage = item.image.trim();
  }

  const fallbackImage = getImageForCategory(item.category, item.title);
  const displayImage = !imageError && rawImage ? rawImage : fallbackImage;

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (processing) return;
    try {
      await toggleFavorite(itemId);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const isAvailable = !item.availability || item.availability === "available";

  return (
    <Link to={`/itemdetail/${itemId}`} className="card">
      <div className="photo">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Floating status / swap badge */}
        <div className="cardFloatingBadge">
          {isAvailable ? (
            <span className="cardPillSwap">Swap</span>
          ) : (
            <span className={`cardPillStatus status-${item.availability}`}>
              {item.availability}
            </span>
          )}
        </div>

        <button
          type="button"
          className={`heart ${isSaved ? "saved" : ""} ${processing ? "processing" : ""}`}
          onClick={handleHeartClick}
          onMouseDown={(e) => e.stopPropagation()}
          title={isSaved ? "Remove from saved items" : "Save item to favorites"}
          aria-label={
            isSaved ? "Remove from saved items" : "Save item to favorites"
          }
          aria-pressed={isSaved}
          disabled={processing}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="heartSvg"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="info">
        <div className="line">
          <b className="cardTitle" title={title}>
            {title}
          </b>
          {formattedValue && (
            <span className="cardSwapValue">{formattedValue}</span>
          )}
        </div>

        <div className="meta">
          <span className="cardBrand">{brand}</span>
          {size && <span> · {size}</span>}
          {condition && <span> · {condition}</span>}
        </div>

        <div className="meta cardLocation">
          <span className="locPin">📍</span>
          <span className="locText">{location}</span>
        </div>
      </div>
    </Link>
  );
}

export default ClothingCard;
