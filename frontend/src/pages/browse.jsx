// ============================================================================
// ReWear — Explore / Browse Page (src/pages/browse.jsx)
// Search, Category, Condition, and Location filters connected to backend
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClothingCard from '../components/ClothingCard';

const API = 'http://localhost:5000/api';

function Browse() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All', 'Jacket', 'Dress', 'Top', 'Shoes', 'Bag', 'Hoodie', 'Pants', 'Shirt'];
  const conditions = ['All', 'Like new', 'Good', 'Fair'];
  const knownLocations = [
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
    'Delhi, NCR',
    'Pune, Maharashtra',
    'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan',
    'Hyderabad, Telangana',
    'Kochi, Kerala',
    'Chandigarh, Punjab',
    'Kolkata, West Bengal',
    'Chennai, Tamil Nadu',
    'Coimbatore, Tamil Nadu',
    'Surat, Gujarat',
    'Nagpur, Maharashtra',
    'Lucknow, Uttar Pradesh',
    'Thiruvananthapuram, Kerala',
    'Indore, Madhya Pradesh',
    'Bhopal, Madhya Pradesh',
    'Patna, Bihar',
    'Visakhapatnam, Andhra Pradesh',
  ];

  // The "chip" row combines categories, conditions, and Nearby
  const chips = ['All', 'Nearby', 'Like new', ...categories.filter(c => c !== 'All')];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedCondition !== 'All') params.set('condition', selectedCondition);
      if (selectedLocation !== 'All' && selectedLocation.trim()) {
        params.set('location', selectedLocation.trim());
      } else if (nearbyOnly && user?.location && user.location !== 'Earth') {
        params.set('location', user.location);
      }

      const response = await fetch(`${API}/items?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load items');
        return;
      }

      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while loading items');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedCondition, selectedLocation, nearbyOnly, user]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  // Handle chip click — maps to category/condition/nearby
  const handleChipClick = (chip) => {
    if (chip === 'All') {
      setSelectedCategory('All');
      setSelectedCondition('All');
      setNearbyOnly(false);
    } else if (chip === 'Nearby') {
      setNearbyOnly(true);
      setSelectedCategory('All');
      setSelectedCondition('All');
    } else if (chip === 'Like new') {
      setSelectedCondition('Like new');
      setSelectedCategory('All');
      setNearbyOnly(false);
    } else {
      setSelectedCategory(chip);
      setSelectedCondition('All');
      setNearbyOnly(false);
    }
  };

  // Which chip is "active" for display
  const activeChip = nearbyOnly
    ? 'Nearby'
    : selectedCondition !== 'All'
    ? selectedCondition
    : selectedCategory !== 'All'
    ? selectedCategory
    : 'All';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedLocation('All');
    setNearbyOnly(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedCondition !== 'All' || selectedLocation !== 'All' || nearbyOnly;

  return (
    <main className="page-container">
      {/* Top Header */}
      <div className="exploreTop">
        <div>
          <div className="eyebrow">THE COMMUNITY WARDROBE</div>
          <h1>Explore clothing</h1>
          <p className="muted">Find pre-loved pieces nearby, compare estimated swap values, and exchange with trust.</p>
        </div>
        <Link to="/additem" className="btn dark">
          ＋ List an item
        </Link>
      </div>

      {/* Search Bar */}
      <div className="searchbar">
        <input
          type="text"
          placeholder="Search dresses, jackets, Zara, size M…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search clothing"
        />
        {searchQuery && (
          <button
            type="button"
            className="btn light"
            onClick={() => setSearchQuery('')}
            style={{ padding: '0 16px', fontSize: '12px' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Secondary Filter Bar: Condition & Location */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--muted)' }}>
          Filter:
        </span>

        {conditions.map((c) => (
          <span
            key={c}
            className={`chip ${selectedCondition === c && c !== 'All' ? 'on' : ''}`}
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => {
              setSelectedCondition(selectedCondition === c ? 'All' : c);
              setNearbyOnly(false);
            }}
          >
            {c === 'All' ? 'All Conditions' : c}
          </span>
        ))}

        {user && user.location && user.location !== 'Earth' && (
          <span
            className={`chip ${selectedLocation === user.location || nearbyOnly ? 'on' : ''}`}
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => {
              if (selectedLocation === user.location) {
                setSelectedLocation('All');
                setNearbyOnly(false);
              } else {
                setSelectedLocation(user.location);
                setNearbyOnly(false);
              }
            }}
          >
            📍 Near {user.location}
          </span>
        )}

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <label htmlFor="browse-location-select" style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--muted)' }}>
            📍 Location:
          </label>
          <select
            id="browse-location-select"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setNearbyOnly(false);
            }}
            style={{
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-full)',
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: 700,
              background: selectedLocation !== 'All' ? 'var(--ink)' : '#fff',
              color: selectedLocation !== 'All' ? '#fff' : 'var(--ink)',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <option value="All" style={{ background: '#fff', color: 'var(--ink)' }}>All Locations</option>
            {knownLocations.map((loc) => (
              <option key={loc} value={loc} style={{ background: '#fff', color: 'var(--ink)' }}>
                {loc}
              </option>
            ))}
            <option value="NonExistentCity, Nowhere" style={{ background: '#fff', color: 'var(--ink)' }}>
              Non-existent Location (Test Empty State)
            </option>
          </select>
        </div>
      </div>

      {/* Category Chips */}
      <div className="chips" style={{ marginBottom: '28px' }}>
        {chips.map((chip) => (
          <span
            key={chip}
            className={`chip ${activeChip === chip ? 'on' : ''}`}
            onClick={() => handleChipClick(chip)}
          >
            {chip}
          </span>
        ))}
      </div>

      {/* Results Header Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>
          {!loading && `${items.length} ${items.length === 1 ? 'piece available' : 'pieces available'}`}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sage)', textDecoration: 'underline' }}
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid Results */}
      <div className="cards">
        {loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--line)', borderTopColor: 'var(--sage)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p className="muted" style={{ marginTop: '14px', fontSize: '14px' }}>Loading conscious wardrobe…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0' }}>
            <p style={{ color: 'var(--rose)', fontWeight: 700 }}>{error}</p>
            <button type="button" className="btn light" onClick={fetchItems} style={{ marginTop: '12px' }}>
              Retry Loading
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🌿</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
              {hasActiveFilters ? 'No pieces match your search or filters.' : 'No clothing listed yet.'}
            </h3>
            <p className="muted" style={{ maxWidth: '440px', margin: '0 auto 20px' }}>
              Try broadening your category or location filters, or be the first to list a piece in this category!
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                className="btn dark"
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            ) : (
              <Link to="/additem" className="btn dark">
                ＋ List an item
              </Link>
            )}
          </div>
        )}

        {!loading && !error && items.map((item) => (
          <ClothingCard key={item._id} item={item} />
        ))}
      </div>
    </main>
  );
}

export default Browse;