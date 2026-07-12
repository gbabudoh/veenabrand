"use client";

import React, { useRef, useEffect } from "react";
import { useStore } from "@/lib/StoreContext";

const QUICK_REPLIES = [
  "Track my order",
  "Sizing help",
  "Returns",
  "Bespoke process",
  "Store locations",
];

export default function AskVeenaChat() {
  const {
    chatOpen,
    toggleChat,
    chatMessages,
    chatDraft,
    setChatDraft,
    sendChatMessage,
  } = useStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change or chat is opened
  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  };

  const handleQuickReplyClick = (reply: string) => {
    sendChatMessage(reply);
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          right: "28px",
          bottom: "28px",
          zIndex: 70,
          background: "#1F5C42",
          color: "#F6F2EA",
          border: "none",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: "0 10px 26px rgba(31, 92, 66, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        💬
      </button>

      {/* CHAT PANEL */}
      {chatOpen && (
        <div style={{
          position: "fixed",
          right: "28px",
          bottom: "98px",
          zIndex: 70,
          width: "340px",
          height: "460px",
          background: "#F6F2EA",
          borderRadius: "10px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(21, 19, 15, 0.1)",
          animation: "fadeIn 0.2s ease"
        }}>
          {/* Panel Header */}
          <div style={{
            background: "#15130F",
            color: "#F6F2EA",
            padding: "16px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 500 }}>
                Ask Veena
              </div>
              <div style={{ fontSize: "10.5px", color: "rgba(246, 242, 234, 0.55)", marginTop: "2px" }}>
                Usually replies instantly
              </div>
            </div>
            <span
              onClick={toggleChat}
              style={{ cursor: "pointer", fontSize: "18px", opacity: 0.8 }}
            >
              ×
            </span>
          </div>

          {/* Messages Log */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            {chatMessages.map((msg) => {
              const isUser = msg.from === "user";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start"
                  }}
                >
                  <div style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "12.5px",
                    lineHeight: 1.5,
                    background: isUser ? "#15130F" : "#EEE7D8",
                    color: isUser ? "#F6F2EA" : "#15130F"
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Panel Controls & Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(21, 19, 15, 0.1)"
          }}>
            {/* Quick Replies */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "10px"
            }}>
              {QUICK_REPLIES.map((reply) => (
                <span
                  key={reply}
                  onClick={() => handleQuickReplyClick(reply)}
                  style={{
                    fontSize: "11px",
                    border: "1px solid rgba(21, 19, 15, 0.25)",
                    borderRadius: "999px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    background: "#fff",
                    transition: "all 0.2s ease"
                  }}
                >
                  {reply}
                </span>
              ))}
            </div>

            {/* Input Row */}
            <div style={{
              display: "flex",
              gap: "8px",
              alignItems: "center"
            }}>
              <input
                type="text"
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                style={{
                  flex: 1,
                  border: "1px solid rgba(21, 19, 15, 0.2)",
                  borderRadius: "999px",
                  padding: "10px 14px",
                  fontSize: "12.5px",
                  outline: "none",
                  background: "#fff"
                }}
              />
              <button
                onClick={() => sendChatMessage()}
                style={{
                  background: "#1F5C42",
                  color: "#fff",
                  border: "none",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
