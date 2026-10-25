import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "./AuthContext";
import API_BASE_URL from "../api";
const FavoritesContext = createContext();



const API = API_BASE_URL;

const LOCAL_STORAGE_KEY = "rewear_favorites";

export function FavoritesProvider({ children }) {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [inFlight, setInFlight] = useState({});
  const initialFetchDone = useRef(false);

  // Sync favorites to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage:", e);
    }
  }, [favorites]);

  // When token/user changes, fetch favorites from backend
  useEffect(() => {
    if (!token) {
      initialFetchDone.current = false;
      return;
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
          // Merge server favorites with local favorites without creating unneeded reference updates
          setFavorites((prev) => {
            const merged = Array.from(new Set([...prev, ...data.favorites]));
            if (merged.length === prev.length && merged.every((id, idx) => id === prev[idx])) {
              return prev; // Preserves reference to prevent unnecessary effect triggers
            }
            return merged;
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
  }, [token]);

  const isFavorited = useCallback(
    (itemId) => {
      if (!itemId) return false;
      const strId = itemId.toString();
      return favorites.includes(strId);
    },
    [favorites]
  );

  const isProcessing = useCallback(
    (itemId) => {
      if (!itemId) return false;
      return Boolean(inFlight[itemId.toString()]);
    },
    [inFlight]
  );

  const toggleFavorite = useCallback(
    async (itemId) => {
      if (!itemId) return;
      const strId = itemId.toString();

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

      // If user is authenticated, persist to backend
      if (token) {
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
            setFavorites(data.favorites);
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
        }
      }

      setInFlight((prev) => {
        const next = { ...prev };
        delete next[strId];
        return next;
      });
    },
    [favorites, token, inFlight]
  );

  const contextValue = useMemo(
    () => ({
      favorites,
      favoritesCount: favorites.length,
      isFavorited,
      isProcessing,
      toggleFavorite,
    }),
    [favorites, isFavorited, isProcessing, toggleFavorite]
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
