// ============================================================================
// ReWear — Community Hub Page (src/pages/community.jsx)
// Community members, local swap hubs, guidelines, and circular impact
// ============================================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClothingCard from "../components/ClothingCard";

const API = "http://localhost:5000/api";

function Community() {
  const [recentCommunityItems, setRecentCommunityItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const swapHubs = [
    { city: "Ahmedabad", state: "Gujarat", members: "420+", swaps: "185", tag: "Fastest Growing Hub" },
    { city: "Bengaluru", state: "Karnataka", members: "680+", swaps: "260", tag: "Most Active Exchanges" },
    { city: "Mumbai", state: "Maharashtra", members: "540+", swaps: "210", tag: "Vintage & Designer Circle" },
    { city: "Pune", state: "Maharashtra", members: "310+", swaps: "120", tag: "Campus & Casual Swaps" },
    { city: "Delhi NCR", state: "North Hub", members: "490+", swaps: "195", tag: "Winterwear Exchange Hub" },
  ];

  const communitySpotlights = [
    {
      name: "Priya Sharma",
      location: "Bengaluru, Karnataka",
      swaps: 14,
      specialty: "Linen tops & sustainable summer dresses",
      joined: "Member since May 2026",
    },
    {
      name: "Rohan Patel",
      location: "Ahmedabad, Gujarat",
      swaps: 19,
      specialty: "Vintage denim jackets & outerwear",
      joined: "Member since Feb 2026",
    },
    {
      name: "Ananya Deshmukh",
      location: "Pune, Maharashtra",
      swaps: 11,
      specialty: "Casual hoodies & cotton essentials",
      joined: "Member since Jun 2026",
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API}/items?limit=4`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.items) {
            setRecentCommunityItems(data.items.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Community fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, []);

  return (
    <main className="page-container">
      {/* Community Header Banner */}
      <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 48px" }}>
        <div className="eyebrow">CIRCULAR WARDROBES TOGETHER</div>
        <h1 style={{ fontSize: "46px", letterSpacing: "-1.5px", marginBottom: "16px" }}>
          The ReWear Community
        </h1>
        <p className="muted" style={{ fontSize: "16px", lineHeight: "1.65" }}>
          Every garment exchanged is a vote for conscious consumption. Connect with local swappers, trade fairly without money pressure, and extend the lifecycle of clothes you love.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          <Link to="/browse" className="btn dark">
            Explore Community Clothes →
          </Link>
          <Link to="/additem" className="btn light">
            Share a Piece
          </Link>
        </div>
      </div>

      {/* Community Stats Highlights */}
      <section className="statsBand" aria-label="Community Vital Metrics" style={{ marginTop: 0, marginBottom: "56px" }}>
        <div className="stat">
          <b>2,400+</b>
          <span>active swappers</span>
        </div>
        <div className="stat">
          <b>612</b>
          <span>swaps completed this month</span>
        </div>
        <div className="stat">
          <b>18 kg</b>
          <span>average waste saved per user</span>
        </div>
        <div className="stat">
          <b>₹0</b>
          <span>cash spent on fast fashion</span>
        </div>
      </section>

      {/* Local Swap Hubs */}
      <section className="section" style={{ marginTop: 0 }}>
        <div className="sectionHead">
          <div>
            <div className="eyebrow">LOCAL EXCHANGE HUBS</div>
            <h2>Active swapping circles</h2>
          </div>
          <Link to="/browse">View location filters →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
          {swapHubs.map((hub) => (
            <div
              key={hub.city}
              className="panel"
              style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <span className="pill" style={{ alignSelf: "flex-start", fontSize: "10.5px" }}>
                {hub.tag}
              </span>
              <h3 style={{ fontSize: "18px", margin: "6px 0 2px" }}>{hub.city}</h3>
              <p className="muted" style={{ fontSize: "12.5px", margin: 0 }}>
                📍 {hub.state}
              </p>
              <div style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                <span><strong>{hub.members}</strong> members</span>
                <span style={{ color: "var(--sage)", fontWeight: 700 }}>{hub.swaps} swaps</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Community Contributors */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">COMMUNITY SPOTLIGHT</div>
            <h2>Featured circular swappers</h2>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {communitySpotlights.map((swapper) => (
            <div
              key={swapper.name}
              className="panel"
              style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(swapper.name)}`}
                alt={swapper.name}
                style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid var(--sage2)", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "15px" }}>{swapper.name}</strong>
                  <span className="pill" style={{ fontSize: "10px", padding: "2px 7px" }}>Verified</span>
                </div>
                <div className="muted" style={{ fontSize: "12px", marginTop: "2px" }}>
                  📍 {swapper.location}
                </div>
                <div style={{ fontSize: "12.5px", marginTop: "6px", color: "var(--ink-secondary)" }}>
                  👗 <em>{swapper.specialty}</em>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--sage)", fontWeight: 700, marginTop: "6px" }}>
                  ✨ {swapper.swaps} successful garment exchanges
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">OUR VALUES</div>
            <h2>The ReWear Swapping Code</h2>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          <div className="panel">
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🧼</div>
            <h3 style={{ fontSize: "17px", marginBottom: "6px" }}>Clean & Fresh First</h3>
            <p className="muted" style={{ fontSize: "13px", lineHeight: "1.55" }}>
              Only list garments that have been washed, dried, and checked for odor or stains. Treat another member's wardrobe with the care you expect for your own.
            </p>
          </div>

          <div className="panel">
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
            <h3 style={{ fontSize: "17px", marginBottom: "6px" }}>Radical Transparency</h3>
            <p className="muted" style={{ fontSize: "13px", lineHeight: "1.55" }}>
              Clearly photograph any flaws, missing buttons, or fabric pilling. A small imperfection is completely fine as long as both swappers agree beforehand.
            </p>
          </div>

          <div className="panel">
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚖️</div>
            <h3 style={{ fontSize: "17px", marginBottom: "6px" }}>Fair Valuation Guidance</h3>
            <p className="muted" style={{ fontSize: "13px", lineHeight: "1.55" }}>
              Use our estimated swap value as a neutral benchmark. No cash transactions happen on ReWear — fairness is built on mutual appreciation of pre-loved pieces.
            </p>
          </div>

          <div className="panel">
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🤝</div>
            <h3 style={{ fontSize: "17px", marginBottom: "6px" }}>Safe Handover Coordination</h3>
            <p className="muted" style={{ fontSize: "13px", lineHeight: "1.55" }}>
              Choose well-lit public meetup spots (cafes, transit hubs, community centers) for local exchanges or exchange via tracked courier for distant swaps.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Community Listings */}
      {recentCommunityItems.length > 0 && (
        <section className="section">
          <div className="sectionHead">
            <div>
              <div className="eyebrow">RECENT CONTRIBUTIONS</div>
              <h2>Freshly added by community members</h2>
            </div>
            <Link to="/browse">Browse all pieces →</Link>
          </div>

          <div className="cards">
            {recentCommunityItems.map((item) => (
              <ClothingCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default Community;
