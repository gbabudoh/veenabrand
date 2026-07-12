"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  size: string;
  colorName: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    priceMinor: number;
    currency: string;
    category: string;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface ChatMessage {
  id: string;
  from: "bot" | "user";
  text: string;
}

interface StoreContextType {
  gender: "WOMEN" | "MEN";
  setGender: (g: "WOMEN" | "MEN") => void;
  cart: Cart | null;
  loadingCart: boolean;
  addToCart: (productId: string, size: string, colorName: string, quantity?: number) => Promise<void>;
  updateCartItemQty: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // chat
  chatOpen: boolean;
  toggleChat: () => void;
  chatMessages: ChatMessage[];
  chatDraft: string;
  setChatDraft: (text: string) => void;
  sendChatMessage: (text?: string) => Promise<void>;

  // modals
  activeModal: "tryon" | "adjustment" | "bespoke" | null;
  modalProps: any;
  openModal: (type: "tryon" | "adjustment" | "bespoke", props?: any) => void;
  closeModal: () => void;

  // cookie consent
  cookieVisible: boolean;
  acceptCookies: () => void;
  rejectCookies: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGenderState] = useState<"WOMEN" | "MEN">("WOMEN");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  
  // chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      from: "bot",
      text: "Hi, I'm Veena's shopping assistant. Ask me about sizing, orders, bespoke or returns.",
    },
  ]);

  // modal states
  const [activeModal, setActiveModal] = useState<"tryon" | "adjustment" | "bespoke" | null>(null);
  const [modalProps, setModalProps] = useState<any>(null);

  // cookie banner states
  const [cookieVisible, setCookieVisible] = useState(false);

  // Load gender preference, cart and cookie consent on mount
  useEffect(() => {
    // 1. Gender preference
    const savedGender = localStorage.getItem("veena_gender") as "WOMEN" | "MEN";
    if (savedGender === "WOMEN" || savedGender === "MEN") {
      setGenderState(savedGender);
    }

    // 2. Cookie consent
    const cookieConsent = localStorage.getItem("veena_cookie_consent");
    if (!cookieConsent) {
      setCookieVisible(true);
    }

    // 3. Cart loading
    refreshCart();
  }, []);

  const setGender = (g: "WOMEN" | "MEN") => {
    setGenderState(g);
    localStorage.setItem("veena_gender", g);
  };

  const refreshCart = async () => {
    try {
      setLoadingCart(true);
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  const addToCart = async (productId: string, size: string, colorName: string, quantity = 1) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, colorName, quantity }),
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const updateCartItemQty = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error("Failed to update cart item quantity:", err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    await updateCartItemQty(itemId, 0);
  };

  // chat actions
  const toggleChat = () => setChatOpen((prev) => !prev);

  const sendChatMessage = async (text?: string) => {
    const messageText = text || chatDraft.trim();
    if (!messageText) return;

    if (!text) {
      setChatDraft("");
    }

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).slice(2, 9),
      from: "user",
      text: messageText,
    };

    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMessage: ChatMessage = {
          id: Math.random().toString(36).slice(2, 9),
          from: "bot",
          text: data.reply,
        };
        setChatMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  // modal actions
  const openModal = (type: "tryon" | "adjustment" | "bespoke", props?: any) => {
    setActiveModal(type);
    setModalProps(props || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalProps(null);
  };

  // cookie consent actions
  const acceptCookies = () => {
    localStorage.setItem("veena_cookie_consent", "accepted");
    setCookieVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("veena_cookie_consent", "rejected");
    setCookieVisible(false);
  };

  return (
    <StoreContext.Provider
      value={{
        gender,
        setGender,
        cart,
        loadingCart,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        refreshCart,
        
        chatOpen,
        toggleChat,
        chatMessages,
        chatDraft,
        setChatDraft,
        sendChatMessage,

        activeModal,
        modalProps,
        openModal,
        closeModal,

        cookieVisible,
        acceptCookies,
        rejectCookies,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
