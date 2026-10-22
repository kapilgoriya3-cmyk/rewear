// ============================================================================
// ReWear — Dedicated Saved Pieces / Wishlist Page (src/pages/saved.jsx)
// ============================================================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import denimJacketImg from '../assets/denimJacket.jpg';
import floralDressImg from '../assets/floralDress.jpg';
import greenHoodieImg from '../assets/greenHoodie.jpg';
import leatherBackpackImg from '../assets/leatherBackpack.jpg';
import blackTopImg from '../assets/blackTop.jpg';

const API = 'http://localhost:5000/api';

function getImageForCategory(category, title) {
  const cat = (category || '').toLowerCase();
  const t = (title || '').toLowerCase();
  if (cat.includes('dress') || t.includes('dress') || t.includes('zara')) return floralDressImg;
  if (cat.includes('top') || t.includes('top') || cat.includes('shirt')) return blackTopImg;
  if (cat.includes('hoodie') || t.includes('hoodie')) return greenHoodieImg;
  if (cat.includes('bag') || t.includes('bag') || cat.includes('shoe')) return leatherBackpackImg;
  return denimJacketImg;
}

function SavedCard({ item, onToggleFavorite, isSaved, processing }) {
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  const itemId = item._id || item.id;
  const title = item.title || 'Untitled Piece';
  const brand = item.brand || 'Vintage / Unbranded';
  const size = item.size || '';
  const condition = item.condition || '';
  const location = item.location || 'Local community';

  // Format estimated swap value
  const rawValue = item.estimatedValue || item.price;
  const formattedValue =
    typeof rawValue === 'number'
      ? `₹${rawValue.toLocaleString('en-IN')}`
      : typeof rawValue === 'string' && rawValue.startsWith('₹')
      ? rawValue
      : rawValue
      ? `₹${rawValue}`
      : null;

  // Determine image source
  let rawImage = '';
  if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string' && item.images[0].trim() !== '') {
    rawImage = item.images[0].trim();
  } else if (typeof item.image === 'string' && item.image.trim() !== '') {
    rawImage = item.image.trim();
  }

  const fallbackImage = getImageForCategory(item.category, item.title);
  const displayImage = !imageError && rawImage ? rawImage : fallbackImage;

  const isAvailable = !item.availability || item.availability === 'available';

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (processing) return;
    onToggleFavorite(itemId);
  };

  return (
    <Link
      to={`/itemdetail/${itemId}`}
      className="savedCard"
      id={`saved-card-${itemId}`}
    >
      <div className="savedCardPhoto">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Floating status badge */}
        <div className="savedCardBadge">
          {isAvailable ? (
            <span className="cardPillSwap">Swap</span>
          ) : (
            <span className={`cardPillStatus status-${item.availability}`}>
              {item.availability}
            </span>
          )}
        </div>

        {/* Small Heart Control Button */}
        <button
          type="button"
          className={`savedCardHeart ${isSaved ? 'saved' : ''} ${processing ? 'processing' : ''}`}
          onClick={handleHeartClick}
          onMouseDown={(e) => e.stopPropagation()}
          title={isSaved ? 'Remove from saved pieces' : 'Save piece to favorites'}
          aria-label={isSaved ? `Remove ${title} from saved pieces` : `Save ${title} to favorites`}
          aria-pressed={isSaved}
          disabled={processing}
          id={`saved-heart-btn-${itemId}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="savedCardInfo">
        <div className="savedCardTitleRow">
          <strong className="savedCardTitle" title={title}>
            {title}
          </strong>
          {formattedValue && (
            <span className="savedCardValue">{formattedValue}</span>
          )}
        </div>

        <div className="savedCardMeta">
          <span className="savedCardBrand">{brand}</span>
          {size && <span> · {size}</span>}
          {condition && <span> · {condition}</span>}
        </div>

        <div className="savedCardLocation">
          <span>📍</span>
          <span>{location}</span>
        </div>
      </div>
    </Link>
  );
}

function Saved() {
  const { token } = useAuth();
  const { favorites, favoritesCount, toggleFavorite, isProcessing, isFavorited } = useFavorites();

  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch populated saved items
  const fetchSavedItems = async () => {
    if (!favorites || favorites.length === 0) {
      setSavedItems([]);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. If authenticated, fetch populated favorites
      if (token) {
        const res = await fetch(`${API}/auth/favorites?populate=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.items) ? data.items : [];
          setSavedItems(items);
          return;
        }
      }

      // 2. Fallback: fetch all items and filter by favorites
      const res = await fetch(`${API}/items`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      const allItems = Array.isArray(data) ? data : data.items || [];
      const filtered = allItems.filter((it) =>
        favorites.includes((it._id || it.id || '').toString())
      );
      setSavedItems(filtered);
    } catch (err) {
      console.error('Error loading saved items:', err);
      setError('Could not load your saved pieces. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, [token]);

  // Keep displayed items strictly in sync with favorites
  const displayedItems = useMemo(() => {
    return savedItems.filter((item) =>
      favorites.includes((item._id || item.id || '').toString())
    );
  }, [savedItems, favorites]);

  // Handle heart click with immediate optimistic removal
  const handleToggle = async (itemId) => {
    try {
      await toggleFavorite(itemId);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  return (
    <main className="page-container savedPage">
      {/* Header section */}
      <div className="savedHeader">
        <div className="savedHeaderLeft">
          <span className="eyebrow">YOUR WISHLIST</span>
          <div className="savedTitleRow">
            <h1 className="savedTitle">Saved Pieces</h1>
            <span className="savedCountBadge" id="saved-pieces-count">
              {displayedItems.length} {displayedItems.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
        </div>

        <Link
          to="/browse"
          className="btn light savedExploreBtn"
          id="saved-explore-more-btn"
        >
          Explore More Pieces →
        </Link>
      </div>

      {/* Loading state */}
      {loading && displayedItems.length === 0 && (
        <div className="savedLoadingBox" id="saved-loading-state">
          <div className="savedSpinner" />
          <p className="muted" style={{ marginTop: '14px', fontSize: '14px' }}>
            Loading your saved pieces…
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="savedErrorBox" id="saved-error-state">
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
          <p style={{ color: 'var(--rose)', fontWeight: 700, margin: '0 0 12px', fontSize: '14px' }}>
            {error}
          </p>
          <button
            type="button"
            className="btn light"
            style={{ fontSize: '13px' }}
            onClick={fetchSavedItems}
            id="saved-retry-btn"
          >
            🔄 Retry Loading
          </button>
        </div>
      )}

      {/* Empty Wishlist State */}
      {!loading && !error && displayedItems.length === 0 && (
        <div className="savedEmptyBox" id="saved-empty-state">
          <div className="savedEmptyIcon">♡</div>
          <h2 className="savedEmptyTitle">Your Wishlist is Empty</h2>
          <p className="savedEmptyText">
            You haven't saved any clothing pieces yet. Click the heart icon on any piece you love while browsing to save it here for future swapping.
          </p>
          <Link
            to="/browse"
            className="btn dark"
            id="saved-browse-wardrobe-btn"
            style={{ display: 'inline-flex' }}
          >
            Browse Community Wardrobe →
          </Link>
        </div>
      )}

      {/* Saved Pieces Responsive Grid */}
      {!loading && !error && displayedItems.length > 0 && (
        <div className="savedPiecesGrid" id="saved-pieces-grid">
          {displayedItems.map((item) => {
            const itemId = item._id || item.id;
            return (
              <SavedCard
                key={itemId}
                item={item}
                onToggleFavorite={handleToggle}
                isSaved={isFavorited(itemId)}
                processing={isProcessing(itemId)}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Saved;
