"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const LEGAL_CONTENT = {
  terms: {
    title: "Terms & Conditions",
    text: "By using the Veena website you agree to purchase products subject to availability, accurate sizing information provided at checkout, and our right to cancel orders suspected of fraud. All prices are listed in Nigerian Naira unless otherwise stated at checkout for international customers."
  },
  privacy: {
    title: "Privacy Policy",
    text: "Veena collects the information you provide at checkout (name, address, measurements for bespoke orders) solely to fulfil and improve your order. We never sell customer data to third parties. Measurement data submitted for bespoke or fitting requests is retained only for the duration needed to complete your order."
  },
  payment: {
    title: "Payment Terms",
    text: "We accept major debit/credit cards, direct bank transfer, and pay-on-delivery within Lagos. Bespoke orders require a 50% deposit at order confirmation, with the balance due before dispatch. All bespoke deposits are non-refundable once cutting has begun."
  },
  shipping: {
    title: "Shipping Policy",
    text: "Lagos orders placed before 2pm qualify for next-day delivery. Orders to other Nigerian states arrive within 2–3 business days. Out-of-Lagos remote deliveries may take up to 5 business days. International orders are shipped via courier and typically arrive within 7–14 business days, duties may apply."
  },
  cookies: {
    title: "Cookie Policy",
    text: "Veena uses essential cookies to keep your bag and session active, and optional analytics cookies to understand how customers browse the site. You can withdraw consent for optional cookies at any time from this page."
  }
};

type LegalTab = keyof typeof LEGAL_CONTENT;

function LegalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");

  // Sync active tab state with URL query parameter
  useEffect(() => {
    const tabQuery = searchParams.get("tab") as LegalTab;
    if (tabQuery && LEGAL_CONTENT[tabQuery]) {
      setActiveTab(tabQuery);
    }
  }, [searchParams]);

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    router.push(`/legal?tab=${tab}`);
  };

  const pillStyle = (active: boolean) => ({
    fontSize: "12.5px",
    letterSpacing: "0.03em",
    padding: "9px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    background: active ? "#15130F" : "rgba(21, 19, 15, 0.08)",
    color: active ? "#F6F2EA" : "#15130F",
    fontWeight: 500,
    transition: "all 0.2s ease"
  });

  const activeContent = LEGAL_CONTENT[activeTab] || LEGAL_CONTENT.terms;

  return (
    <div className="container-legal fade-in" style={{ padding: "60px 24px 110px" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "34px", margin: "0 0 32px", fontWeight: 500 }}>
        Policies
      </h1>

      {/* Pill tabs switcher */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "36px", flexWrap: "wrap" }}>
        {(Object.keys(LEGAL_CONTENT) as LegalTab[]).map((key) => {
          const isActive = activeTab === key;
          const label = LEGAL_CONTENT[key].title;
          return (
            <span
              key={key}
              onClick={() => handleTabChange(key)}
              style={pillStyle(isActive)}
            >
              {label}
            </span>
          );
        })}
      </div>

      {/* Policy Text Body */}
      <div style={{
        fontSize: "14px",
        lineHeight: 1.85,
        color: "rgba(21, 19, 15, 0.72)",
        maxWidth: "840px"
      }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "#15130F", marginBottom: "16px", fontWeight: 500 }}>
          {activeContent.title}
        </h2>
        <p>{activeContent.text}</p>
      </div>
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense fallback={<div className="container-legal" style={{ padding: "60px 24px", textAlign: "center" }}>Loading policies...</div>}>
      <LegalPageContent />
    </Suspense>
  );
}
