// ============================================================================
// ReWear — Home Page (src/pages/home.jsx)
// ============================================================================
import API_BASE_URL from "../api";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClothingCard from '../components/ClothingCard';
import floralDress from '../assets/floralDress.jpg';
import denimJacket from '../assets/denimJacket.jpg';
import greenHoodie from '../assets/greenHoodie.jpg';
import leatherBackpack from '../assets/leatherBackpack.jpg';

const API = API_BASE_URL;

function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);

  // Fallback curated items
  const fallbackItems = [
    {
      _id: '1',
      title: 'Floral Midi Dress',
      brand: 'H&M Conscious',
      size: 'M',
      condition: 'Like new',
      estimatedValue: 1200,
      location: 'Ahmedabad, Gujarat',
      category: 'Dress',
      image: floralDress
    },
    {
      _id: '2',
      title: 'Vintage Denim Jacket',
      brand: "Levi's",
      size: 'M',
      condition: 'Like new',
      estimatedValue: 1800,
      location: 'Mumbai, Maharashtra',
      category: 'Jacket',
      image: denimJacket
    },
    {
      _id: '3',
      title: 'Sage Green Organic Hoodie',
      brand: 'Uniqlo',
      size: 'L',
      condition: 'Good',
      estimatedValue: 950,
      location: 'Bengaluru, Karnataka',
      category: 'Hoodie',
      image: greenHoodie
    },
    {
      _id: '4',
      title: 'Handcrafted Leather Backpack',
      brand: 'Fossil',
      size: 'One size',
      condition: 'Like new',
      estimatedValue: 2400,
      location: 'Pune, Maharashtra',
      category: 'Bag',
      image: leatherBackpack
    }
  ];

  // Fetch real listings from backend if available
  useEffect(() => {
    let isMounted = true;
    const fetchRealItems = async () => {
      try {
        const res = await fetch(`${API}/items?limit=4`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.items && data.items.length > 0) {
            setFeaturedItems(data.items.slice(0, 4));
          } else if (isMounted) {
            setFeaturedItems(fallbackItems);
          }
        } else if (isMounted) {
          setFeaturedItems(fallbackItems);
        }
      } catch {
        if (isMounted) setFeaturedItems(fallbackItems);
      }
    };

    fetchRealItems();
    return () => { isMounted = false; };
  }, []);

  const displayItems = featuredItems.length > 0 ? featuredItems : fallbackItems;

  return (
    <main className="page-container">
      {/* HERO SECTION */}
      <section className="hero" aria-label="Hero Introduction">
        <div className="heroCopy">
          <div className="eyebrow">CLOTHING EXCHANGE, REIMAGINED</div>
          <h1>
            Wear less new.<br />
            <em>Swap more.</em>
          </h1>
          <p>
            ReWear is a conscious community marketplace for exchanging clothes you already own — with people nearby, fair-value suggestions, and zero buying pressure.
          </p>

          <div className="heroActions">
            <Link to="/browse" className="btn dark">
              Explore the Wardrobe →
            </Link>
            <Link to="/additem" className="btn light">
              List a Piece
            </Link>
          </div>

          <div className="heroNote">
            <span style={{ color: 'var(--sage)', fontSize: '14px' }}>●</span>
            <span>2,400+ active members · 612 swaps completed this month</span>
          </div>
        </div>

        <div className="heroVisual" role="img" aria-label="Curated fashion collection">
          <div className="floating">
            <span>♻ 18 kg textile waste avoided</span>
          </div>

          <div className="heroCard">
            <div className="row">
              <img src={floralDress} alt="Floral midi dress" />
              <div>
                <b style={{ fontSize: '13.5px', color: 'var(--ink)' }}>Floral Midi Dress</b>
                <div className="meta" style={{ marginTop: '2px' }}>M · Like new · 2.1 km</div>
                <div style={{ fontWeight: 850, color: 'var(--sage)', fontSize: '12.5px', marginTop: '4px' }}>
                  ₹1,200 estimated swap value
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="statsBand" aria-label="Marketplace Statistics">
        <div className="stat">
          <b>2,400+</b>
          <span>community members</span>
        </div>
        <div className="stat">
          <b>2,845</b>
          <span>clothes listed</span>
        </div>
        <div className="stat">
          <b>612</b>
          <span>successful swaps</span>
        </div>
        <div className="stat">
          <b>18 kg</b>
          <span>waste avoided by you</span>
        </div>
      </section>

      {/* CURATED DISCOVER SECTION */}
      <section className="section" aria-label="Curated Wardrobe Pieces">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">DISCOVER</div>
            <h2>Pieces worth swapping</h2>
          </div>
          <Link to="/browse">
            View all clothing →
          </Link>
        </div>

        <div className="cards">
          {displayItems.map((item) => (
            <ClothingCard key={item._id || item.id} item={item} />
          ))}
        </div>
      </section>

      {/* EDITORIAL SECTION */}
      <section className="section" aria-label="Community Values">
        <div className="editorial">
          <div className="editorialBox darkBox">
            <div className="eyebrow" style={{ color: '#d9eadf' }}>
              NEARBY SWAPS
            </div>
            <h2>Find something within 5 km.</h2>
            <div>Local exchange means less shipping footprint, faster handovers, and real community connection.</div>
          </div>

          <div className="editorialBox greenBox">
            <div className="eyebrow" style={{ color: '#ffffff' }}>
              YOUR IMPACT
            </div>
            <h2>Every swap keeps a piece in circulation.</h2>
            <div>Track your trades, celebrate extended garment lifespans, and measure textile waste saved together.</div>
          </div>
        </div>
      </section>

      {/* HOW REWEAR WORKS SECTION */}
      <section className="section" aria-label="How ReWear Works">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">SIMPLE BY DESIGN</div>
            <h2>How ReWear works</h2>
          </div>
          <Link to="/how-it-works">Learn full process →</Link>
        </div>

        <div className="how">
          <div className="box">
            <div className="number">01 — LIST</div>
            <h3>Give an unworn piece a new chance.</h3>
            <p className="muted">
              Upload photos, select brand, size, condition, and get an automated fair estimated swap value.
            </p>
          </div>

          <div className="box">
            <div className="number">02 — MATCH</div>
            <h3>Find an honest exchange.</h3>
            <p className="muted">
              Browse by category, size, and distance. Compare suggested values so both parties feel confident.
            </p>
          </div>

          <div className="box">
            <div className="number">03 — EXCHANGE</div>
            <h3>Chat, agree, and swap.</h3>
            <p className="muted">
              Negotiate directly in-app, meet locally or arrange door-to-door courier for distant swaps.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
