import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';
import { fetchServerCart, saveServerCart } from '../services/cartService.js';
import { getErrorMessage } from '../services/api.js';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../utils/constants.js';

const GUEST_CART_KEY = 'wizhex_guest_cart';
const SAVE_DELAY_MS = 500;

const CartContext = createContext(null);

function isValidItem(item) {
  return (
    item &&
    typeof item.productId === 'string' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.price === 'number'
  );
}

function readGuestCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    /* storage full or blocked: the cart still works for this visit */
  }
}

export function toCartItem(product, quantity) {
  return {
    productId: product._id,
    name: product.name,
    image: product.images?.[0] || '',
    price: product.price,
    originalPrice: product.originalPrice > product.price ? product.originalPrice : product.price,
    stock: product.stock,
    quantity,
  };
}

function fromServerItem(serverItem) {
  if (!serverItem?.product?._id) return null;
  return toCartItem(serverItem.product, serverItem.quantity);
}

function mergeCarts(serverItems, guestItems) {
  const merged = new Map(serverItems.map((item) => [item.productId, { ...item }]));
  guestItems.forEach((guestItem) => {
    const existing = merged.get(guestItem.productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + guestItem.quantity, existing.stock);
    } else {
      merged.set(guestItem.productId, { ...guestItem });
    }
  });
  return [...merged.values()].filter((item) => item.quantity > 0);
}

const serialize = (items) =>
  items
    .map((item) => `${item.productId}:${item.quantity}`)
    .sort()
    .join('|');

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?._id ?? null;

  const [items, setItems] = useState(readGuestCart);
  const [syncing, setSyncing] = useState(false);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const syncedUserRef = useRef(undefined); // undefined = auth not resolved yet
  const syncingRef = useRef(false);
  const syncRequestRef = useRef(0);
  const lastSavedRef = useRef('');

  // 1) React to login / logout: load the server cart and merge the guest cart into it.
  useEffect(() => {
    if (authLoading || syncedUserRef.current === userId) return;
    const previousUser = syncedUserRef.current;
    syncedUserRef.current = userId;
    const requestId = ++syncRequestRef.current;

    if (!userId) {
      syncingRef.current = false;
      setSyncing(false);
      // A logout empties the visible cart; the saved cart stays on the server.
      if (previousUser) setItems([]);
      return;
    }

    syncingRef.current = true;
    setSyncing(true);

    (async () => {
      try {
        const guestItems = readGuestCart();
        let finalItems = (await fetchServerCart()).map(fromServerItem).filter(Boolean);
        if (guestItems.length) {
          const merged = mergeCarts(finalItems, guestItems);
          finalItems = (await saveServerCart(merged)).map(fromServerItem).filter(Boolean);
          writeGuestCart([]);
        }
        if (syncRequestRef.current !== requestId) return;
        lastSavedRef.current = serialize(finalItems);
        setItems(finalItems);
      } catch (error) {
        if (syncRequestRef.current !== requestId) return;
        // Avoid overwriting the server cart with possibly stale local data.
        lastSavedRef.current = serialize(itemsRef.current);
        toast.error(getErrorMessage(error, 'Could not load your saved cart'));
      } finally {
        if (syncRequestRef.current === requestId) {
          syncingRef.current = false;
          setSyncing(false);
        }
      }
    })();
  }, [userId, authLoading]);

  // 2) Persist changes: localStorage for guests, debounced API save for users.
  useEffect(() => {
    if (authLoading || syncingRef.current) return undefined;

    if (!userId) {
      writeGuestCart(items);
      return undefined;
    }

    const key = serialize(items);
    if (key === lastSavedRef.current) return undefined;

    const timer = setTimeout(() => {
      saveServerCart(items)
        .then(() => {
          lastSavedRef.current = key;
        })
        .catch((error) => toast.error(getErrorMessage(error, 'Could not save your cart')));
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [items, userId, authLoading]);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product || product.stock <= 0) {
      toast.error('Sorry, this product is out of stock');
      return false;
    }

    const existing = itemsRef.current.find((item) => item.productId === product._id);
    const currentQty = existing?.quantity ?? 0;

    if (currentQty >= product.stock) {
      toast.error(`Only ${product.stock} in stock, and they're all in your cart`);
      return false;
    }

    const requested = currentQty + Math.max(1, Math.floor(quantity));
    const nextQty = Math.min(requested, product.stock);
    const nextItem = toCartItem(product, nextQty);

    setItems((prev) =>
      prev.some((item) => item.productId === product._id)
        ? prev.map((item) => (item.productId === product._id ? nextItem : item))
        : [...prev, nextItem],
    );

    if (nextQty < requested) {
      toast(`Only ${product.stock} available, so we adjusted the quantity`);
    } else {
      toast.success('Added to cart');
    }
    return true;
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const clamped = Math.max(1, Math.min(Math.floor(quantity) || 1, item.stock));
        return { ...item, quantity: clamped };
      }),
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getItemQuantity = useCallback(
    (productId) => items.find((item) => item.productId === productId)?.quantity ?? 0,
    [items],
  );

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const mrpTotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
      itemCount,
      subtotal,
      mrpTotal,
      savings: mrpTotal - subtotal,
      shipping,
      total: subtotal + shipping,
      amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      syncing,
      ...totals,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
    }),
    [items, syncing, totals, addItem, updateQuantity, removeItem, clearCart, getItemQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
