// ============================================================================
// ReWear — How It Works Page (src/pages/howitworks.jsx)
// ============================================================================
// Exact implementation matching ReWear Premium Marketplace UI Concept v2 (V5 Dedicated System)
// ============================================================================

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'List your piece',
      description: 'Add photos, clothing type, size, brand, condition, location and an estimated swap value.'
    },
    {
      number: '02',
      title: 'Discover a match',
      description: 'Browse the community wardrobe and filter by category, size and location.'
    },
    {
      number: '03',
      title: 'Compare value',
      description: 'See estimated values for both items to make the proposed exchange easier to judge.'
    },
    {
      number: '04',
      title: 'Send a request',
      description: 'Choose the item you want to offer and send a swap request to the owner.'
    },
    {
      number: '05',
      title: 'Chat & negotiate',
      description: 'Discuss condition, photos, timing and exchange method before confirming.'
    },
    {
      number: '06',
      title: 'Exchange',
      description: 'Meet nearby or arrange a courier, then track the swap through completion.'
    }
  ];

  return (
    <main className="page-container">
      {/* HOW HERO SECTION */}
      <div className="howHero">
        <div className="howIntro">
          <img
            className="howIntroImg"
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90"
            alt="The ReWear Journey"
          />
          <div className="howIntroOverlay"></div>
          <div className="howIntroCopy">
            <div className="eyebrow" style={{ color: '#b9dcc7' }}>
              THE REWEAR JOURNEY
            </div>
            <h1>
              Give clothes<br />
              <em>a second life.</em>
            </h1>
            <p>
              ReWear turns an unused piece in your wardrobe into an opportunity to discover something new-to-you — without a traditional checkout.
            </p>
          </div>
        </div>

        <div className="howSide">
          <div className="eyebrow">SWAP, DON'T SHOP</div>
          <h2 style={{ fontSize: '32px', marginTop: '10px' }}>
            A simple exchange from listing to handover.
          </h2>
          <p className="muted">
            Everything needed for Phase 1 lives in one journey: listings, fair-value guidance, location matching, requests, negotiation and swap tracking.
          </p>
          <div className="howSideVisual">
            <div className="howMini">
              <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=85" alt="Floral Dress Mini" />
            </div>
            <div className="howMini">
              <img src="https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=600&q=85" alt="Denim Jacket Mini" />
            </div>
          </div>
          <div className="valueBox">
            <span>Example estimated swap value</span>
            <b>₹1,200 ↔ ₹1,000</b>
          </div>
          <small className="muted" style={{ marginTop: '8px' }}>
            The ₹ value is only a fairness reference. ReWear does not process a purchase for the swap.
          </small>
        </div>
      </div>

      {/* SECTION 01 — THE FLOW */}
      <div className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">01 — THE FLOW</div>
            <h2>Six steps. One complete swap.</h2>
          </div>
        </div>
        <div className="flowTimeline">
          {steps.map((step) => (
            <div key={step.number} className="flowStep">
              <div className="stepCircle">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 02 — FAIRNESS */}
      <div className="section">
        <div className="howFeature">
          <div className="howPhoto">
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=90" alt="Fairness Valuation" />
          </div>
          <div className="howInfo">
            <div className="eyebrow">02 — FAIRNESS</div>
            <h2>What does the ₹ value actually mean?</h2>
            <p className="muted">
              It is a suggested comparison value — not money in your account and not a selling price.
            </p>
            <ul>
              <li>Brand influences the estimate.</li>
              <li>Condition changes the estimate.</li>
              <li>Category helps keep comparisons sensible.</li>
              <li>Original price provides additional context.</li>
              <li>Users still negotiate and decide the final swap.</li>
            </ul>
            <div className="valueDemo">
              <div className="valueItem">
                <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=85" alt="Floral Midi Dress" />
                <b>Floral Midi Dress</b>
                <div className="value">₹1,000</div>
              </div>
              <div className="valueArrow">↔</div>
              <div className="valueItem">
                <img src="https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=500&q=85" alt="Denim Jacket" />
                <b>Denim Jacket</b>
                <div className="value">₹1,200</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 03 — EXCHANGE OPTIONS */}
      <div className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">03 — EXCHANGE OPTIONS</div>
            <h2>Choose the handover that works.</h2>
          </div>
        </div>
        <div className="howExchange">
          <div className="exchangeCard">
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85" alt="Local Exchange" />
            <div className="exchangeCopy">
              <div className="eyebrow" style={{ color: '#d9eadf' }}>
                LOCAL EXCHANGE
              </div>
              <h2>Meet nearby.</h2>
              <p>
                Location-based matching helps reduce distance, shipping cost and unnecessary packaging.
              </p>
            </div>
          </div>
          <div className="exchangeCard">
            <img
              src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1100&q=85"
              alt="Remote Exchange"
            />
            <div className="exchangeCopy">
              <div className="eyebrow" style={{ color: '#d9eadf' }}>
                REMOTE EXCHANGE
              </div>
              <h2>Ship when distance matters.</h2>
              <p>
                For remote swaps, users can discuss courier arrangements before confirming the exchange.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 04 — BEFORE YOU CONFIRM */}
      <div className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">04 — BEFORE YOU CONFIRM</div>
            <h2>Keep the exchange clear.</h2>
          </div>
        </div>
        <div className="faqGrid">
          <div className="panel">
            <h3>Check the condition</h3>
            <p className="muted">
              Use listing photos and chat to confirm wear, defects and measurements before agreeing.
            </p>
          </div>
          <div className="panel">
            <h3>Agree on the handover</h3>
            <p className="muted">
              For local swaps, agree on a practical public meetup. For remote swaps, discuss courier arrangements.
            </p>
          </div>
          <div className="panel">
            <h3>Use the estimated value as guidance</h3>
            <p className="muted">
              A ₹200 difference does not automatically make a swap unfair. The users decide what they are comfortable exchanging.
            </p>
          </div>
          <div className="panel">
            <h3>Track the status</h3>
            <p className="muted">
              Requests move through pending, negotiating, accepted and completed states so both sides know what happens next.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HowItWorks;
