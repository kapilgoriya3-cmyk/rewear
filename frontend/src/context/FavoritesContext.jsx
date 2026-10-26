import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import API_BASE_URL from "../api";
const FavoritesContext = createContext();

const API = API_BASE_URL;

const STORAGE_PREFIX = "rewear_favorites_";

function getStoredUserFavorites() {
  try {
    const savedToken = localStorage.getItem("rewear_token");
    const savedUserStr = localStorage.getItem("rewear_user");
    if (!savedToken || !savedUserStr) return [];
    const parsedUser = JSON.parse(savedUserStr);
    const uid = parsedUser?.id || parsedUser?._id;
    if (!uid) return [];
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${uid}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const { user, token } = useAuth();
  const userId = user?.id || user?._id;

  const [favorites, setFavorites] = useState(() => getStoredUserFavorites());

  const [inFlight, setInFlight] = useState({});
  const initialFetchDone = useRef(false);

  // Sync favorites to user-scoped localStorage whenever it changes
  useEffect(() => {
    try {
      if (token && userId) {
        localStorage.setItem(
          `${STORAGE_PREFIX}${userId}`,
          JSON.stringify(favorites),
        );
      }
      // Remove legacy unscoped key if present
      localStorage.removeItem("rewear_favorites");
    } catch (e) {
      console.error("Failed to save favorites to localStorage:", e);
    }
  }, [favorites, token, userId]);

  // When token or user changes, immediately update favorites
  useEffect(() => {
    if (!token || !userId) {
      // Logged out: immediately clear in-memory favorites
      setFavorites([]);
      initialFetchDone.current = false;
      return;
    }

    // Authenticated: load user-specific cached favorites first for immediate UI
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    }

    let isMounted = true;
    const fetchUserFavorites = async () => {
      try {
        const res = await fetch(`${API}/auth/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data.favorites)) {
          const serverFavs = data.favorites.map(String);
          setFavorites((prev) => {
            if (
              prev.length === serverFavs.length &&
              prev.every((id, idx) => id === serverFavs[idx])
            ) {
              return prev;
            }
            return serverFavs;
          });
        }
      } catch (err) {
        console.error("Error fetching user favorites:", err);
      } finally {
        if (isMounted) initialFetchDone.current = true;
      }
    };

    fetchUserFavorites();

    return () => {
      isMounted = false;
    };
  }, [token, userId]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const isFavorited = useCallback(
    (itemId) => {
      if (!itemId) return false;
      const strId = itemId.toString();
      return favorites.includes(strId);
    },
    [favorites],
  );

  const isProcessing = useCallback(
    (itemId) => {
      if (!itemId) return false;
      return Boolean(inFlight[itemId.toString()]);
    },
    [inFlight],
  );

  const toggleFavorite = useCallback(
    async (itemId) => {
      if (!itemId) return;
      const strId = itemId.toString();

      if (!token) {
        if (
          window.confirm(
            "Please log in to save pieces to your wishlist.\n\nWould you like to go to the login page?",
          )
        ) {
          window.location.href = "/login";
        }
        return;
      }

      // Prevent duplicate concurrent requests
      if (inFlight[strId]) return;

      const currentlyLiked = favorites.includes(strId);
      const nextLiked = !currentlyLiked;

      // Mark in-flight
      setInFlight((prev) => ({ ...prev, [strId]: true }));

      // Optimistic state update
      setFavorites((prev) => {
        if (nextLiked) {
          return prev.includes(strId) ? prev : [...prev, strId];
        } else {
          return prev.filter((id) => id !== strId);
        }
      });

      // Persist to backend
      try {
        const res = await fetch(`${API}/auth/favorites/${strId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data.favorites)) {
          setFavorites(data.favorites.map(String));
        }
      } catch (err) {
        console.error("Failed to sync favorite with server, reverting:", err);
        // Rollback on server failure
        setFavorites((prev) => {
          if (currentlyLiked) {
            return prev.includes(strId) ? prev : [...prev, strId];
          } else {
            return prev.filter((id) => id !== strId);
          }
        });
      } finally {
        setInFlight((prev) => {
          const next = { ...prev };
          delete next[strId];
          return next;
        });
      }
    },
    [favorites, token, inFlight],
  );

  const contextValue = useMemo(
    () => ({
      favorites,
      favoritesCount: favorites.length,
      isFavorited,
      isProcessing,
      toggleFavorite,
      clearFavorites,
    }),
    [favorites, isFavorited, isProcessing, toggleFavorite, clearFavorites],
  );

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
