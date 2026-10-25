// ============================================================================
// ReWear — Admin Dashboard (src/pages/admin.jsx)
// Real data from MongoDB via /api/admin/* endpoints
// ============================================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../api";

const API = `${API_BASE_URL}/admin`;
function Admin() {
  const { user, token } = useAuth();
  console.log("Logged-in user:", user);
  console.log("User role:", user?.role);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("analytics");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const [swaps, setSwaps] = useState([]);
  const [swapsLoading, setSwapsLoading] = useState(false);

  const [accessDenied, setAccessDenied] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  // ── Check admin access ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Quick client-side guard; real guard is on the backend
    setAccessDenied(user.role !== "admin");
  }, [user, navigate]);

  // ── Fetch analytics ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || accessDenied) return;
    const load = async () => {
      try {
        const res = await fetch(`${API}/analytics`, { headers });
        const data = await res.json();
        if (res.ok) {
          setAnalytics(data);
        } else {
          setAnalyticsError(data.message || "Failed to load analytics");
          if (res.status === 403) setAccessDenied(true);
        }
      } catch {
        setAnalyticsError("Could not reach server");
      } finally {
        setAnalyticsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, accessDenied]);

  // ── Fetch users ────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API}/users`, { headers });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch {
      console.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // ── Fetch listings ─────────────────────────────────────────────────────
  const loadListings = async () => {
    setListingsLoading(true);
    try {
      const res = await fetch(`${API}/listings`, { headers });
      const data = await res.json();
      if (res.ok) setListings(data.items);
    } catch {
      console.error("Failed to load listings");
    } finally {
      setListingsLoading(false);
    }
  };

  // ── Fetch swaps ────────────────────────────────────────────────────────
  const loadSwaps = async () => {
    setSwapsLoading(true);
    try {
      const res = await fetch(`${API}/swaps`, { headers });
      const data = await res.json();
      if (res.ok) setSwaps(data.swaps);
    } catch {
      console.error("Failed to load swaps");
    } finally {
      setSwapsLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (accessDenied || !token) return;
    if (activeTab === "users" && users.length === 0) loadUsers();
    if (activeTab === "listings" && listings.length === 0) loadListings();
    if (activeTab === "swaps" && swaps.length === 0) loadSwaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, accessDenied, token]);

  // ── Delete listing (admin) ─────────────────────────────────────────────
  const adminDelete = async (itemId) => {
    if (!window.confirm("Remove this listing from the platform?")) return;
    try {
      const res = await fetch(`${API}/listings/${itemId}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        setListings((prev) => prev.filter((i) => i._id !== itemId));
        alert("Listing removed.");
      } else {
        alert(data.message || "Failed to remove listing");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  // ── Status badge ───────────────────────────────────────────────────────
  const statusBadge = (status) =>
    ({
      pending: { bg: "#fff3cd", color: "#856404" },
      accepted: { bg: "#dfece3", color: "#2d6b4b" },
      rejected: { bg: "#fde8e8", color: "#9b1c1c" },
      cancelled: { bg: "#f3f3f3", color: "#555" },
    })[status] || { bg: "#f3f3f3", color: "#555" };

  if (accessDenied) {
    return (
      <main className="page-container">
        <div className="auth" style={{ textAlign: "center" }}>
          <div className="logo">
            re<span>wear</span>.
          </div>
          <h1 style={{ fontSize: "28px" }}>Access Denied</h1>
          <p className="muted">You do not have admin privileges.</p>
          <button
            type="button"
            className="btn dark"
            style={{ marginTop: "16px" }}
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  const sideButtons = [
    { key: "analytics", label: "📊 Analytics" },
    { key: "users", label: "👥 Users" },
    { key: "listings", label: "📦 Listings" },
    { key: "swaps", label: "🔄 Swaps" },
  ];

  return (
    <main className="page-container">
      <div className="admin">
        {/* Sidebar */}
        <div className="side">
          <div className="logo" style={{ color: "#fff" }}>
            re<span style={{ color: "#7ecfa3" }}>wear</span>.
          </div>
          <p
            style={{ fontSize: "11px", color: "#9db8a8", marginBottom: "16px" }}
          >
            Admin Panel
          </p>
          {sideButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              className={activeTab === btn.key ? "on" : ""}
              onClick={() => setActiveTab(btn.key)}
            >
              {btn.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ marginTop: "20px", color: "#9db8a8" }}
          >
            ← Back to site
          </button>
        </div>

        {/* Main content */}
        <div className="adminMain">
          {/* ── ANALYTICS ──────────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <span className="eyebrow">PLATFORM OVERVIEW</span>
                <h2 style={{ margin: "8px 0 4px" }}>Analytics</h2>
                <p className="muted" style={{ fontSize: "13px" }}>
                  Real-time data from MongoDB.
                </p>
              </div>

              {analyticsLoading && <p className="muted">Loading analytics…</p>}
              {analyticsError && (
                <p style={{ color: "#9b1c1c" }}>{analyticsError}</p>
              )}

              {analytics && (
                <>
                  <div className="dashboardStats">
                    {[
                      { label: "Total Users", value: analytics.totalUsers },
                      {
                        label: "Total Listings",
                        value: analytics.totalListings,
                      },
                      {
                        label: "Total Swap Requests",
                        value: analytics.totalSwaps,
                      },
                      {
                        label: "Active Listings",
                        value: analytics.activeListings,
                      },
                    ].map((stat) => (
                      <div className="dashStat" key={stat.label}>
                        <b>{stat.value}</b>
                        <div
                          className="muted"
                          style={{ fontSize: "12px", marginTop: "6px" }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dashboardStats" style={{ marginTop: "12px" }}>
                    {[
                      {
                        label: "Accepted Swaps",
                        value: analytics.acceptedSwaps,
                        color: "#2d6b4b",
                      },
                      {
                        label: "Rejected Swaps",
                        value: analytics.rejectedSwaps,
                        color: "#9b1c1c",
                      },
                      {
                        label: "Conversion Rate",
                        value: `${analytics.swapConversionRate}%`,
                        color: "#2d6b4b",
                      },
                    ].map((stat) => (
                      <div className="dashStat" key={stat.label}>
                        <b style={{ color: stat.color }}>{stat.value}</b>
                        <div
                          className="muted"
                          style={{ fontSize: "12px", marginTop: "6px" }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conversion rate bar */}
                  <div className="panel" style={{ marginTop: "16px" }}>
                    <h3 style={{ marginBottom: "12px" }}>
                      Swap Conversion Rate
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div className="bar" style={{ flex: 1 }}>
                        <span
                          style={{ width: `${analytics.swapConversionRate}%` }}
                        />
                      </div>
                      <span
                        style={{
                          fontWeight: 900,
                          color: "var(--sage)",
                          minWidth: "42px",
                        }}
                      >
                        {analytics.swapConversionRate}%
                      </span>
                    </div>
                    <p
                      className="muted"
                      style={{ fontSize: "12px", marginTop: "10px" }}
                    >
                      {analytics.acceptedSwaps} accepted out of{" "}
                      {analytics.totalSwaps} total swap requests.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── USERS ──────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <span className="eyebrow">USER MANAGEMENT</span>
                <h2 style={{ margin: "8px 0 4px" }}>All Users</h2>
                <p className="muted" style={{ fontSize: "13px" }}>
                  {users.length} registered users.
                </p>
              </div>

              {usersLoading && <p className="muted">Loading users…</p>}

              {!usersLoading && (
                <div className="tableWrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Location</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.location || "—"}</td>
                          <td>
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "3px 8px",
                                borderRadius: "999px",
                                fontWeight: 800,
                                background:
                                  u.role === "admin" ? "#dfece3" : "#f3f3f3",
                                color: u.role === "admin" ? "#2d6b4b" : "#555",
                              }}
                            >
                              {u.role || "user"}
                            </span>
                          </td>
                          <td>
                            {new Date(u.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── LISTINGS ───────────────────────────────────────────── */}
          {activeTab === "listings" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <span className="eyebrow">LISTING MANAGEMENT</span>
                <h2 style={{ margin: "8px 0 4px" }}>All Listings</h2>
                <p className="muted" style={{ fontSize: "13px" }}>
                  {listings.length} total listings.
                </p>
              </div>

              {listingsLoading && <p className="muted">Loading listings…</p>}

              {!listingsLoading && (
                <div className="tableWrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Owner</th>
                        <th>Category</th>
                        <th>Condition</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((item) => (
                        <tr key={item._id}>
                          <td>{item.title}</td>
                          <td>{item.owner?.name || "—"}</td>
                          <td>{item.category}</td>
                          <td>{item.condition}</td>
                          <td>
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "3px 7px",
                                borderRadius: "999px",
                                fontWeight: 800,
                                background:
                                  item.availability === "available"
                                    ? "#dfece3"
                                    : "#fde8e8",
                                color:
                                  item.availability === "available"
                                    ? "#2d6b4b"
                                    : "#9b1c1c",
                              }}
                            >
                              {item.availability || "available"}
                            </span>
                          </td>
                          <td>{item.location || "—"}</td>
                          <td>
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn light"
                              style={{
                                padding: "5px 10px",
                                fontSize: "11px",
                                borderColor: "#f8b4b4",
                                color: "#9b1c1c",
                              }}
                              onClick={() => adminDelete(item._id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── SWAPS ──────────────────────────────────────────────── */}
          {activeTab === "swaps" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <span className="eyebrow">SWAP MONITORING</span>
                <h2 style={{ margin: "8px 0 4px" }}>All Swap Requests</h2>
                <p className="muted" style={{ fontSize: "13px" }}>
                  {swaps.length} total swap requests.
                </p>
              </div>

              {swapsLoading && <p className="muted">Loading swaps…</p>}

              {!swapsLoading && (
                <div className="tableWrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Requester</th>
                        <th>Receiver</th>
                        <th>Offered Item</th>
                        <th>Requested Item</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {swaps.map((swap) => {
                        const badge = statusBadge(swap.status);
                        return (
                          <tr key={swap._id}>
                            <td>{swap.requester?.name || "—"}</td>
                            <td>{swap.receiver?.name || "—"}</td>
                            <td>{swap.offeredItem?.title || "—"}</td>
                            <td>{swap.requestedItem?.title || "—"}</td>
                            <td>
                              <span
                                style={{
                                  fontSize: "10px",
                                  padding: "3px 8px",
                                  borderRadius: "999px",
                                  fontWeight: 800,
                                  background: badge.bg,
                                  color: badge.color,
                                }}
                              >
                                {swap.status}
                              </span>
                            </td>
                            <td>
                              {new Date(swap.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Admin;
