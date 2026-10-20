import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';
import { addToWishlist, fetchWishlist, removeFromWishlist } from '../services/wishlistService.js';
import { getErrorMessage } from '../services/api.js';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?._id ?? null;
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    if (authLoading) return undefined;
    if (!userId) {
      setProducts([]);
      return undefined;
    }

    let active = true;
    setLoading(true);
    fetchWishlist()
      .then((list) => {
        if (active) setProducts(list);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, authLoading]);

  const ids = useMemo(() => new Set(products.map((product) => product._id)), [products]);

  const isWishlisted = useCallback((productId) => ids.has(productId), [ids]);

  const toggleWishlist = useCallback(
    async (product) => {
      if (!userId) {
        toast('Log in to save items to your wishlist');
        navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } } });
        return;
      }

      const previous = productsRef.current;
      const wasWishlisted = previous.some((item) => item._id === product._id);

      // Optimistic update with rollback on failure.
      setProducts(wasWishlisted ? previous.filter((item) => item._id !== product._id) : [product, ...previous]);

      try {
        const updated = wasWishlisted
          ? await removeFromWishlist(product._id)
          : await addToWishlist(product._id);
        setProducts(updated);
        toast.success(wasWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
      } catch (error) {
        setProducts(previous);
        toast.error(getErrorMessage(error, 'Could not update your wishlist'));
      }
    },
    [userId, navigate, location.pathname, location.search],
  );

  const value = useMemo(
    () => ({ products, loading, count: products.length, isWishlisted, toggleWishlist }),
    [products, loading, isWishlisted, toggleWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return context;
}
