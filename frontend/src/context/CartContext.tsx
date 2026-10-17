import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart } from '../types';
import { cartApi } from '../api/client';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  totalItems: number;
  addItem: (productId: string, quantity?: number, variantId?: string, color?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const defaultCart: Cart = {
  items: [],
  total_items: 0,
  subtotal: 0,
  delivery_charge: 0,
  free_delivery_threshold: 15000,
  free_delivery_remaining: 15000,
  discount: 0,
  final_total: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data || defaultCart);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async (productId: string, quantity: number = 1, variantId?: string, color?: string) => {
    setIsLoading(true);
    try {
      const updated = await cartApi.addItem({
        product_id: productId,
        quantity,
        variant_id: variantId,
        color
      });
      setCart(updated);
      success('Added item to your shopping cart');
    } catch (err: any) {
      error(err.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    setIsLoading(true);
    try {
      const updated = await cartApi.updateItem(itemId, quantity);
      setCart(updated);
    } catch (err: any) {
      error(err.message || 'Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const updated = await cartApi.removeItem(itemId);
      setCart(updated);
      success('Item removed from cart');
    } catch (err: any) {
      error(err.message || 'Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const updated = await cartApi.clearCart();
      setCart(updated);
    } catch (err: any) {
      error(err.message || 'Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        totalItems: cart.total_items || 0,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
