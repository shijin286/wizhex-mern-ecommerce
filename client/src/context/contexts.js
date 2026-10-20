import { createContext } from 'react';

// Context objects live in their own module so the provider files only export
// components (keeps React Fast Refresh working during development).
export const AuthContext = createContext(null);
export const CartContext = createContext(null);
export const WishlistContext = createContext(null);
