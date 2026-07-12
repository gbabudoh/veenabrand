"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/StoreContext";

export default function Modals() {
  const { activeModal, modalProps, closeModal } = useStore();

  if (!activeModal) return null;

  return (
    <div
      onClick={closeModal}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(21, 19, 15, 0.55)",
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F6F2EA",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "86vh",
          overflowY: "auto",
          padding: "34px",
          color: "#15130F",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)"
        }}
      >
        {activeModal === "tryon" && <TryOnModalContent {...modalProps} />}
        {activeModal === "adjustment" && <AdjustmentModalContent {...modalProps} />}
        {activeModal === "bespoke" && <BespokeModalContent {...modalProps} />}
      </div>
    </div>
  );
}

/* ==========================================================================
   TRY ON MODAL CONTENT
   ========================================================================== */
function TryOnModalContent({ productId }: { productId: string }) {
  const { closeModal } = useStore();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"photo" | "measurements" | "model" | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ predictedSize: string } | null>(null);

  const handleMethodSelect = (m: "photo" | "measurements" | "model") => {
    setMethod(m);
  };

  const handleContinue = () => {
    if (method === "measurements") {
      setStep(1);
    } else {
      // For photo or model, simulate submission directly
      handleSubmitSimulated();
    }
  };

  const handleSubmitSimulated = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/fitting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          method: method || "model"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/fitting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          method: "measurements",
          measurements: {
            height: Number(height),
            weight: Number(weight),
            chestOrBust: Number(chest),
            waist: Number(waist),
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const optionStyle = (active: boolean) => ({
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    padding: "16px",
    border: `1px solid ${active ? "#15130F" : "rgba(21, 19, 15, 0.15)"}`,
    background: active ? "rgba(21, 19, 15, 0.04)" : "transparent",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1F5C42", marginBottom: "8px" }}>
            Online Fitting
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", margin: 0, fontWeight: 500 }}>
            Try It On
          </h2>
        </div>
        <span onClick={closeModal} style={{ cursor: "pointer", fontSize: "20px" }}>×</span>
      </div>

      {step === 0 && (
        <div>
          <p style={{ fontSize: "13.5px", color: "rgba(21, 19, 15, 0.6)", marginBottom: "18px" }}>
            Choose how you'd like to preview the fit.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            <div onClick={() => handleMethodSelect("photo")} style={optionStyle(method === "photo")}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Upload a photo</span>
              <span style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.55)" }}>See the garment overlaid on your own photo</span>
            </div>
            <div onClick={() => handleMethodSelect("measurements")} style={optionStyle(method === "measurements")}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Enter measurements</span>
              <span style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.55)" }}>Get a fit prediction from your body measurements</span>
            </div>
            <div onClick={() => handleMethodSelect("model")} style={optionStyle(method === "model")}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Use a model closest to my build</span>
              <span style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.55)" }}>Preview on a similar body type</span>
            </div>
          </div>
          <button
            onClick={handleContinue}
            disabled={!method || submitting}
            style={{
              width: "100%",
              background: "#15130F",
              color: "#F6F2EA",
              border: "none",
              padding: "14px",
              fontSize: "12.5px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "2px",
              opacity: !method || submitting ? 0.6 : 1
            }}
          >
            {submitting ? "Processing..." : "Continue"}
          </button>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmitMeasurements}>
          <p style={{ fontSize: "13.5px", color: "rgba(21, 19, 15, 0.6)", marginBottom: "18px" }}>
            Add a couple of details so we can predict your fit.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "22px" }}>
            <input
              type="number"
              placeholder="Height (cm)"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
            <input
              type="number"
              placeholder="Chest / Bust (cm)"
              required
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
            <input
              type="number"
              placeholder="Waist (cm)"
              required
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setStep(0)}
              style={{ flex: 1, border: "1px solid #15130F", background: "none", padding: "14px", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex: 2, background: "#15130F", color: "#F6F2EA", border: "none", padding: "14px", fontSize: "12.5px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
            >
              {submitting ? "Analyzing..." : "See My Fit Preview"}
            </button>
          </div>
        </form>
      )}

      {step === 2 && result && (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{
            aspectRatio: "3/4",
            maxWidth: "220px",
            margin: "0 auto 22px",
            borderRadius: "4px",
            background: "linear-gradient(160deg, #e7ddc9, #c7b998)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 20px rgba(0,0,0,0.06)"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(120deg, rgba(21, 19, 15, 0.06) 0 2px, transparent 2px 22px)" }}></div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(21, 19, 15, 0.4)", fontFamily: "var(--font-mono)", fontSize: "10.5px", padding: "12px", textAlign: "center" }}>
              SIMULATED FIT PREVIEW
            </div>
          </div>
          <p style={{ fontSize: "14px", color: "rgba(21, 19, 15, 0.65)", margin: "0 0 22px", lineHeight: 1.6 }}>
            Based on your input, this piece is a predicted true-to-size fit in <strong>{result.predictedSize}</strong>. Not quite right? Request an adjustment from the product page.
          </p>
          <button
            onClick={closeModal}
            style={{ background: "#15130F", color: "#F6F2EA", border: "none", padding: "13px 26px", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   ADJUSTMENT MODAL CONTENT
   ========================================================================== */
function AdjustmentModalContent({ productId }: { productId: string }) {
  const { closeModal } = useStore();
  const [adjType, setAdjType] = useState("Hem length");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ADJUSTMENT_TYPES = ["Hem length", "Sleeve length", "Waist take-in", "Shoulder fit", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          adjustmentType: adjType,
          note
        })
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const typeStyle = (active: boolean) => ({
    fontSize: "12px",
    padding: "8px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    border: `1px solid ${active ? "#15130F" : "rgba(21, 19, 15, 0.2)"}`,
    background: active ? "#15130F" : "transparent",
    color: active ? "#F6F2EA" : "#15130F",
    transition: "all 0.2s ease"
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1F5C42", marginBottom: "8px" }}>
            Request Adjustment
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", margin: 0, fontWeight: 500 }}>
            Tell us what to adjust
          </h2>
        </div>
        <span onClick={closeModal} style={{ cursor: "pointer", fontSize: "20px" }}>×</span>
      </div>

      {submitted ? (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1F5C42", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 20px" }}>✓</div>
          <p style={{ fontSize: "14px", color: "rgba(21, 19, 15, 0.65)", margin: "0 0 22px", lineHeight: 1.6 }}>
            Request sent — our atelier will reply within 48 hours with a quote and timeline for the <strong>{adjType}</strong> adjustment.
          </p>
          <button
            onClick={closeModal}
            style={{ background: "#15130F", color: "#F6F2EA", border: "none", padding: "13px 26px", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px" }}>Adjustment type</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {ADJUSTMENT_TYPES.map((t) => (
              <span
                key={t}
                onClick={() => setAdjType(t)}
                style={typeStyle(adjType === t)}
              >
                {t}
              </span>
            ))}
          </div>
          <textarea
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe the fit issue or what you'd like changed…"
            style={{
              width: "100%",
              minHeight: "100px",
              border: "1px solid rgba(21, 19, 15, 0.2)",
              padding: "12px 14px",
              fontSize: "13px",
              borderRadius: "2px",
              marginBottom: "20px",
              resize: "vertical",
              outline: "none",
              background: "#fff"
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              background: "#15130F",
              color: "#F6F2EA",
              border: "none",
              padding: "14px",
              fontSize: "12.5px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "2px",
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ==========================================================================
   BESPOKE MODAL CONTENT
   ========================================================================== */
function BespokeModalContent({ productId }: { productId?: string }) {
  const { closeModal } = useStore();
  const [fabric, setFabric] = useState("Same as shown");
  const [timeline, setTimeline] = useState("Standard (3-4 weeks)");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [height, setHeight] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const FABRIC_OPTIONS = ["Same as shown", "Premium wool blend", "Silk", "Ankara / wax print", "Customer-supplied fabric"];
  const TIMELINE_OPTIONS = ["Standard (3-4 weeks)", "Priority (2 weeks)", "Flexible / no rush"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceProductId: productId,
          fabricPreference: fabric,
          timeline,
          measurements: {
            chestOrBust: Number(chest),
            waist: Number(waist),
            hip: Number(hip),
            height: Number(height)
          },
          note
        })
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const pillStyle = (active: boolean) => ({
    fontSize: "12px",
    padding: "8px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    border: `1px solid ${active ? "#15130F" : "rgba(21, 19, 15, 0.2)"}`,
    background: active ? "#15130F" : "transparent",
    color: active ? "#F6F2EA" : "#15130F",
    transition: "all 0.2s ease"
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1F5C42", marginBottom: "8px" }}>
            Made to Measure
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", margin: 0, fontWeight: 500 }}>
            Request Bespoke
          </h2>
        </div>
        <span onClick={closeModal} style={{ cursor: "pointer", fontSize: "20px" }}>×</span>
      </div>

      {submitted ? (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1F5C42", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 20px" }}>✓</div>
          <p style={{ fontSize: "14px", color: "rgba(21, 19, 15, 0.65)", margin: "0 0 22px", lineHeight: 1.6 }}>
            Bespoke request received — our atelier will follow up within 48 hours with a quote and a 50% deposit link.
          </p>
          <button
            onClick={closeModal}
            style={{ background: "#15130F", color: "#F6F2EA", border: "none", padding: "13px 26px", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px" }}>Fabric preference</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {FABRIC_OPTIONS.map((f) => (
              <span
                key={f}
                onClick={() => setFabric(f)}
                style={pillStyle(fabric === f)}
              >
                {f}
              </span>
            ))}
          </div>

          <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px" }}>Timeline</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {TIMELINE_OPTIONS.map((t) => (
              <span
                key={t}
                onClick={() => setTimeline(t)}
                style={pillStyle(timeline === t)}
              >
                {t}
              </span>
            ))}
          </div>

          <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px" }}>Measurements (cm)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <input
              type="number"
              placeholder="Chest / Bust (cm)"
              required
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
            <input
              type="number"
              placeholder="Waist (cm)"
              required
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
            <input
              type="number"
              placeholder="Hip (cm)"
              required
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
            <input
              type="number"
              placeholder="Height (cm)"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", background: "#fff", outline: "none" }}
            />
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any notes on fit, budget, or occasion…"
            style={{
              width: "100%",
              minHeight: "80px",
              border: "1px solid rgba(21, 19, 15, 0.2)",
              padding: "12px 14px",
              fontSize: "13px",
              borderRadius: "2px",
              marginBottom: "20px",
              resize: "vertical",
              outline: "none",
              background: "#fff"
            }}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              background: "#15130F",
              color: "#F6F2EA",
              border: "none",
              padding: "14px",
              fontSize: "12.5px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "2px",
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? "Submitting..." : "Submit Bespoke Request"}
          </button>
        </form>
      )}
    </div>
  );
}
