"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import {
  addCartLine,
  applyCoupon,
  type Cart,
  type CartLine,
  type CartResponse,
  changeCartItemQuantity,
  readCart,
  removeCartItem,
  removeCoupon,
  selectShippingRate,
} from "@/lib/cart";
import { type OrderRequest, placeOrder, type PlaceOrderResult } from "@/lib/checkout";

const CART_TOKEN_KEY = "wertes-cart-token";

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isUpdating: boolean;
  errorMessage: string | null;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: CartLine) => Promise<CartResponse>;
  changeQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  chooseShippingRate: (packageId: number, rateId: string) => Promise<void>;
  addCoupon: (code: string) => Promise<void>;
  dropCoupon: (code: string) => Promise<void>;
  submitOrder: (order: OrderRequest) => Promise<PlaceOrderResult>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(CART_TOKEN_KEY);
    if (storedToken === null) {
      return;
    }
    readCart(storedToken).then(applyResponse);
  }, []);

  function applyResponse(response: CartResponse) {
    if (!response.ok) {
      setErrorMessage(response.message);
      return;
    }
    setErrorMessage(null);
    setCart(response.cart);
    setToken(response.token);
    localStorage.setItem(CART_TOKEN_KEY, response.token);
  }

  async function obtainToken() {
    if (token !== null) {
      return token;
    }
    const emptyCart = await readCart(null);
    if (!emptyCart.ok) {
      throw new Error(`Store API refused to start a cart: ${emptyCart.message}`);
    }
    return emptyCart.token;
  }

  async function addLine(line: CartLine) {
    const response = await addCartLine(await obtainToken(), line);
    if (response.ok) {
      applyResponse(response);
      setIsOpen(true);
    }
    return response;
  }

  async function updateWith(request: (currentToken: string) => Promise<CartResponse>) {
    if (token === null) {
      return;
    }
    setIsUpdating(true);
    try {
      applyResponse(await request(token));
    } finally {
      setIsUpdating(false);
    }
  }

  async function submitOrder(order: OrderRequest): Promise<PlaceOrderResult> {
    if (token === null) {
      return { ok: false, message: "Koszyk jest pusty." };
    }
    setIsUpdating(true);
    try {
      return await placeOrder(token, order);
    } finally {
      setIsUpdating(false);
    }
  }

  const value: CartContextValue = {
    cart,
    isOpen,
    isUpdating,
    errorMessage,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addLine,
    changeQuantity: (key, quantity) =>
      updateWith((currentToken) => changeCartItemQuantity(currentToken, key, quantity)),
    removeItem: (key) => updateWith((currentToken) => removeCartItem(currentToken, key)),
    chooseShippingRate: (packageId, rateId) =>
      updateWith((currentToken) => selectShippingRate(currentToken, packageId, rateId)),
    addCoupon: (code) => updateWith((currentToken) => applyCoupon(currentToken, code)),
    dropCoupon: (code) => updateWith((currentToken) => removeCoupon(currentToken, code)),
    submitOrder,
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    throw new Error("useCart needs a CartProvider in the root layout");
  }
  return cartContext;
}
