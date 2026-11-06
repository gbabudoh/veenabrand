"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DEFAULT_NAV_MENU,
  NAV_MENU_KEY,
  newDepartment,
  resolveNavMenu,
  type NavMenu,
  type NavMenuColumn,
  type NavMenuDepartment,
  type NavMenuEditorial,
  type NavMenuItem,
} from "@/lib/mega-menu";
import MediaUploadButton from "@/components/admin/MediaUploadButton";

const MAX_COLUMNS = 4;
const BADGE_SUGGESTIONS = ["Signature", "New", "Limited", "Exclusive", "Sale"];

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  active?: boolean;
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

export default function AdminMegaMenuPage() {
  const [menu, setMenu] = useState<NavMenu>(DEFAULT_NAV_MENU);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(JSON.stringify(DEFAULT_NAV_MENU));
  const [selected, setSelected] = useState(0);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cfgRes, catRes] = await Promise.all([
          fetch("/api/admin/homepage"),
          fetch("/api/admin/categories"),
        ]);
        if (cfgRes.ok) {
          const data = await cfgRes.json();
          const row = data.configs?.find((c: any) => c.key === NAV_MENU_KEY);
          const resolved = resolveNavMenu(row?.value);
          setMenu(resolved);
          // With nothing stored the storefront already renders these defaults.
          setSavedSnapshot(JSON.stringify(resolved));
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dirty = JSON.stringify(menu) !== savedSnapshot;

  // Warn before leaving with unpublished edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const categoryLinks = useMemo(
    () =>
      categories
        .filter((c) => c.active !== false)
        .map((c) => ({
          label: `${c.name}${c.gender ? ` · ${c.gender === "MEN" ? "Men" : "Women"}` : ""}`,
          href: c.gender
            ? `/products?gender=${c.gender}&category=${c.slug}`
            : `/products?category=${c.slug}`,
        })),
    [categories]
  );

  const handleSave = async () => {
    const problems = validate(menu);
    if (problems.length) {
      alert("Please fix before publishing:\n\n• " + problems.join("\n• "));
      return;
    }
    setSaving(true);
    try {
      const value = JSON.stringify(menu);
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: NAV_MENU_KEY, value }),
      });
      if (res.ok) {
        setSavedSnapshot(value);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert("Failed to save the mega menu");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the mega menu");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm("Replace the current menu with the original Veena default? Unpublished edits will be lost.")) return;
    setMenu(DEFAULT_NAV_MENU);
    setSelected(0);
  };

  /* ---------------- immutable update helpers ---------------- */
  const setDepartments = (fn: (d: NavMenuDepartment[]) => NavMenuDepartment[]) =>
    setMenu((prev) => ({ ...prev, departments: fn(prev.departments) }));

  const updateDept = (di: number, patch: Partial<NavMenuDepartment>) =>
    setDepartments((ds) => ds.map((d, i) => (i === di ? { ...d, ...patch } : d)));

  const updateEditorial = (di: number, patch: Partial<NavMenuEditorial>) =>
    setDepartments((ds) =>
      ds.map((d, i) => (i === di ? { ...d, editorial: { ...d.editorial, ...patch } } : d))
    );

  const setColumns = (di: number, fn: (c: NavMenuColumn[]) => NavMenuColumn[]) =>
    setDepartments((ds) => ds.map((d, i) => (i === di ? { ...d, columns: fn(d.columns) } : d)));

  const updateColumn = (di: number, ci: number, patch: Partial<NavMenuColumn>) =>
    setColumns(di, (cs) => cs.map((c, i) => (i === ci ? { ...c, ...patch } : c)));

  const setItems = (di: number, ci: number, fn: (it: NavMenuItem[]) => NavMenuItem[]) =>
    setColumns(di, (cs) => cs.map((c, i) => (i === ci ? { ...c, items: fn(c.items) } : c)));

  const updateItem = (di: number, ci: number, ii: number, patch: Partial<NavMenuItem>) =>
    setItems(di, ci, (its) => its.map((it, i) => (i === ii ? { ...it, ...patch } : it)));

  const addDepartment = () => {
    const d = newDepartment(menu.departments.map((x) => x.id));
    setDepartments((ds) => [...ds, d]);
    setSelected(menu.departments.length);
  };

  const removeDepartment = (di: number) => {
    const name = menu.departments[di]?.name || "this department";
    if (!confirm(`Delete "${name}" and all of its links from the menu?`)) return;
    setDepartments((ds) => ds.filter((_, i) => i !== di));
    setSelected((s) => Math.max(0, s >= di ? s - 1 : s));
  };

  const moveDepartment = (di: number, dir: -1 | 1) => {
    const to = di + dir;
    if (to < 0 || to >= menu.departments.length) return;
    setDepartments((ds) => move(ds, di, to));
    setSelected((s) => (s === di ? to : s === to ? di : s));
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(246,242,234,0.5)", padding: "20px" }}>
        Loading mega menu...
      </div>
    );
  }

  const dept = menu.departments[selected];

  return (
    <div style={{ maxWidth: "1240px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "30px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", margin: 0, fontWeight: 600, color: "#0F172A" }}>
            Mega Menu Manager
          </h1>
          <div style={{ fontSize: "13.5px", color: "#64748B", marginTop: "4px" }}>
            Control the storefront navigation: departments, order, columns, links, badges and spotlight cards.
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {dirty && (
            <span style={{ fontSize: "11.5px", color: "#D97706", letterSpacing: "0.03em", fontWeight: 600 }}>
              ● Unpublished changes
            </span>
          )}
          <button onClick={handleReset} style={ghostBtn}>
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saved ? "#059669" : "#0F172A",
              color: "#FFFFFF",
              border: "none",
              padding: "9px 22px",
              fontSize: "12.5px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
              transition: "all 0.15s ease",
            }}
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Mega Menu"}
          </button>
        </div>
      </div>

      <datalist id="vn-category-links">
        {categoryLinks.map((c) => (
          <option key={c.href} value={c.href}>
            {c.label}
          </option>
        ))}
      </datalist>
      <datalist id="vn-badge-suggestions">
        {BADGE_SUGGESTIONS.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", alignItems: "start" }}>
        {/* ---------------- LEFT: DEPARTMENT LIST ---------------- */}
        <div style={{ ...cardStyle, padding: "16px", position: "sticky", top: "20px" }}>
          <div style={{ ...labelStyle, marginBottom: "12px" }}>Top Navigation · {menu.departments.length}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {menu.departments.map((d, di) => {
              const isSel = di === selected;
              const hidden = d.visible === false;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelected(di)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 10px",
                    borderRadius: "3px",
                    cursor: "pointer",
                    background: isSel ? "rgba(246,242,234,0.08)" : "#0F0E0B",
                    border: `1px solid ${isSel ? "rgba(246,242,234,0.3)" : "rgba(246,242,234,0.08)"}`,
                    opacity: hidden ? 0.5 : 1,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textDecoration: hidden ? "line-through" : "none",
                      }}
                    >
                      {d.name || "Untitled"}
                    </div>
                    <div style={{ fontSize: "10.5px", color: "rgba(246,242,234,0.45)", marginTop: "1px" }}>
                      {d.type === "mega"
                        ? `Dropdown · ${d.columns.reduce((n, c) => n + c.items.length, 0)} links`
                        : "Plain link"}
                    </div>
                  </div>
                  <IconBtn
                    title={hidden ? "Show on storefront" : "Hide from storefront"}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDept(di, { visible: hidden });
                    }}
                  >
                    {hidden ? "◌" : "●"}
                  </IconBtn>
                  <IconBtn
                    title="Move up"
                    disabled={di === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveDepartment(di, -1);
                    }}
                  >
                    ↑
                  </IconBtn>
                  <IconBtn
                    title="Move down"
                    disabled={di === menu.departments.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveDepartment(di, 1);
                    }}
                  >
                    ↓
                  </IconBtn>
                </div>
              );
            })}
          </div>

          <button onClick={addDepartment} style={{ ...ghostBtn, width: "100%", marginTop: "12px" }}>
            + Add Department
          </button>
        </div>

        {/* ---------------- RIGHT: DEPARTMENT EDITOR ---------------- */}
        {!dept ? (
          <div style={{ ...cardStyle, color: "rgba(246,242,234,0.5)" }}>
            No departments yet — add one to start building the menu.
          </div>
        ) : (
          <div>
            {/* Basics */}
            <div style={cardStyle}>
              <SectionHead
                title={`${dept.name || "Untitled"} — Basics`}
                hint="The label in the top bar and where clicking it goes"
                action={
                  <button
                    onClick={() => removeDepartment(selected)}
                    style={{ ...ghostBtn, color: "rgba(255,120,120,0.85)", borderColor: "rgba(255,120,120,0.3)" }}
                  >
                    Delete Department
                  </button>
                }
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Menu Label</label>
                  <input
                    style={inputStyle}
                    value={dept.name}
                    onChange={(e) => updateDept(selected, { name: e.target.value })}
                    placeholder="Women"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Destination Link</label>
                  <input
                    style={inputStyle}
                    list="vn-category-links"
                    value={dept.href}
                    onChange={(e) => updateDept(selected, { href: e.target.value })}
                    placeholder="/products?gender=WOMEN"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <label style={labelStyle}>Behaviour</label>
                  <Segmented
                    value={dept.type}
                    options={[
                      { value: "mega", label: "Dropdown panel" },
                      { value: "link", label: "Plain link" },
                    ]}
                    onChange={(v) => updateDept(selected, { type: v as NavMenuDepartment["type"] })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Visibility</label>
                  <Toggle
                    checked={dept.visible !== false}
                    onChange={(v) => updateDept(selected, { visible: v })}
                    label={dept.visible !== false ? "Shown on storefront" : "Hidden"}
                  />
                </div>
              </div>
            </div>

            {dept.type === "mega" && (
              <>
                {/* Columns & links */}
                <div style={cardStyle}>
                  <SectionHead
                    title="Dropdown Columns & Links"
                    hint="Pick a category from the suggestions or type any link. Hidden links stay saved but don't show."
                    action={
                      <button
                        onClick={() =>
                          setColumns(selected, (cs) => [
                            ...cs,
                            { title: "New Column", items: [{ name: "New Link", href: "/products" }] },
                          ])
                        }
                        disabled={dept.columns.length >= MAX_COLUMNS}
                        style={{ ...ghostBtn, opacity: dept.columns.length >= MAX_COLUMNS ? 0.4 : 1 }}
                      >
                        + Add Column
                      </button>
                    }
                  />

                  <div style={{ marginBottom: "18px", maxWidth: "420px" }}>
                    <label style={labelStyle}>“Shop All” Row Label</label>
                    <input
                      style={inputStyle}
                      value={dept.overviewLabel}
                      onChange={(e) => updateDept(selected, { overviewLabel: e.target.value })}
                      placeholder={`All ${dept.name}`}
                    />
                  </div>

                  {dept.columns.length === 0 && (
                    <div style={{ fontSize: "12.5px", color: "rgba(246,242,234,0.45)" }}>
                      No columns — add one, or switch this department to a plain link.
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {dept.columns.map((col, ci) => (
                      <div
                        key={ci}
                        style={{
                          background: "#0F0E0B",
                          border: "1px solid rgba(246,242,234,0.1)",
                          borderRadius: "3px",
                          padding: "16px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "14px" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ ...labelStyle, color: "var(--color-emerald)" }}>
                              Column 0{ci + 1} Title
                            </label>
                            <input
                              style={inputStyle}
                              value={col.title}
                              onChange={(e) => updateColumn(selected, ci, { title: e.target.value })}
                              placeholder="Separates & Tops"
                            />
                          </div>
                          <IconBtn title="Move column left" disabled={ci === 0} onClick={() => setColumns(selected, (cs) => move(cs, ci, ci - 1))}>
                            ←
                          </IconBtn>
                          <IconBtn
                            title="Move column right"
                            disabled={ci === dept.columns.length - 1}
                            onClick={() => setColumns(selected, (cs) => move(cs, ci, ci + 1))}
                          >
                            →
                          </IconBtn>
                          <IconBtn
                            title="Remove column"
                            danger
                            onClick={() => {
                              if (confirm(`Remove the "${col.title}" column and its links?`))
                                setColumns(selected, (cs) => cs.filter((_, i) => i !== ci));
                            }}
                          >
                            ✕
                          </IconBtn>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1.6fr 120px 104px",
                            gap: "8px",
                            fontSize: "10.5px",
                            color: "rgba(246,242,234,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            padding: "0 2px 6px",
                          }}
                        >
                          <span>Label</span>
                          <span>Link</span>
                          <span>Badge</span>
                          <span />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {col.items.map((item, ii) => {
                            const hidden = item.visible === false;
                            return (
                              <div
                                key={ii}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1.6fr 120px 104px",
                                  gap: "8px",
                                  alignItems: "center",
                                  opacity: hidden ? 0.45 : 1,
                                }}
                              >
                                <input
                                  style={inputSm}
                                  value={item.name}
                                  onChange={(e) => updateItem(selected, ci, ii, { name: e.target.value })}
                                  placeholder="Tops"
                                />
                                <input
                                  style={inputSm}
                                  list="vn-category-links"
                                  value={item.href}
                                  onChange={(e) => updateItem(selected, ci, ii, { href: e.target.value })}
                                  placeholder="/products?category=..."
                                />
                                <input
                                  style={inputSm}
                                  list="vn-badge-suggestions"
                                  value={item.badge || ""}
                                  onChange={(e) => updateItem(selected, ci, ii, { badge: e.target.value })}
                                  placeholder="None"
                                />
                                <div style={{ display: "flex", gap: "2px", justifyContent: "flex-end" }}>
                                  <IconBtn
                                    title={hidden ? "Show link" : "Hide link"}
                                    onClick={() => updateItem(selected, ci, ii, { visible: hidden })}
                                  >
                                    {hidden ? "◌" : "●"}
                                  </IconBtn>
                                  <IconBtn
                                    title="Move up"
                                    disabled={ii === 0}
                                    onClick={() => setItems(selected, ci, (its) => move(its, ii, ii - 1))}
                                  >
                                    ↑
                                  </IconBtn>
                                  <IconBtn
                                    title="Move down"
                                    disabled={ii === col.items.length - 1}
                                    onClick={() => setItems(selected, ci, (its) => move(its, ii, ii + 1))}
                                  >
                                    ↓
                                  </IconBtn>
                                  <IconBtn
                                    title="Remove link"
                                    danger
                                    onClick={() => setItems(selected, ci, (its) => its.filter((_, i) => i !== ii))}
                                  >
                                    ✕
                                  </IconBtn>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() =>
                            setItems(selected, ci, (its) => [...its, { name: "New Link", href: dept.href || "/products" }])
                          }
                          style={{ ...ghostBtn, marginTop: "10px", fontSize: "11.5px", padding: "5px 12px" }}
                        >
                          + Add Link
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spotlight card */}
                <div style={cardStyle}>
                  <SectionHead
                    title="Editorial Spotlight Card"
                    hint="The image card on the right of the dropdown. Turn it off to give the columns the full width."
                    action={
                      <Toggle
                        checked={dept.editorial.visible !== false}
                        onChange={(v) => updateEditorial(selected, { visible: v })}
                        label={dept.editorial.visible !== false ? "Shown" : "Hidden"}
                      />
                    }
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr",
                      gap: "24px",
                      opacity: dept.editorial.visible !== false ? 1 : 0.45,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <div>
                          <label style={labelStyle}>Eyebrow</label>
                          <input
                            style={inputStyle}
                            value={dept.editorial.eyebrow}
                            onChange={(e) => updateEditorial(selected, { eyebrow: e.target.value })}
                            placeholder="Signature Atelier"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Button Text</label>
                          <input
                            style={inputStyle}
                            value={dept.editorial.cta}
                            onChange={(e) => updateEditorial(selected, { cta: e.target.value })}
                            placeholder="Explore Atelier Women"
                          />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Headline</label>
                        <input
                          style={inputStyle}
                          value={dept.editorial.title}
                          onChange={(e) => updateEditorial(selected, { title: e.target.value })}
                          placeholder="The Bubu Silhouette & Hand-Woven Silks"
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Image</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                          <input
                            style={inputStyle}
                            value={dept.editorial.image}
                            onChange={(e) => updateEditorial(selected, { image: e.target.value })}
                            placeholder="/images/hero_women.png"
                          />
                          <MediaUploadButton
                            folder="mega-menu"
                            onUploaded={(url) => updateEditorial(selected, { image: url })}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Card Link</label>
                        <input
                          style={inputStyle}
                          list="vn-category-links"
                          value={dept.editorial.href}
                          onChange={(e) => updateEditorial(selected, { href: e.target.value })}
                          placeholder="/products?gender=WOMEN&category=women-bubu"
                        />
                      </div>
                    </div>

                    <SpotlightPreview editorial={dept.editorial} />
                  </div>
                </div>
              </>
            )}

            {/* Live preview */}
            <div style={cardStyle}>
              <SectionHead title="Live Storefront Preview" hint="How the top bar and this dropdown will look once published" />
              <StorefrontPreview menu={menu} selectedId={dept.id} onSelect={(id) => {
                const i = menu.departments.findIndex((d) => d.id === id);
                if (i >= 0) setSelected(i);
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* validation                                                          */
/* ------------------------------------------------------------------ */
function validate(menu: NavMenu): string[] {
  const out: string[] = [];
  if (!menu.departments.some((d) => d.visible !== false)) out.push("At least one department must be visible.");
  menu.departments.forEach((d) => {
    const label = d.name.trim() || "An untitled department";
    if (!d.name.trim()) out.push("Every department needs a menu label.");
    if (!d.href.trim()) out.push(`${label} needs a destination link.`);
    if (d.type === "mega") {
      d.columns.forEach((c) =>
        c.items.forEach((it) => {
          if (!it.name.trim() || !it.href.trim())
            out.push(`${label} → ${c.title || "a column"} has a link missing its label or URL.`);
        })
      );
    }
  });
  return Array.from(new Set(out));
}

/* ------------------------------------------------------------------ */
/* previews                                                            */
/* ------------------------------------------------------------------ */
function SpotlightPreview({ editorial }: { editorial: NavMenuEditorial }) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "4/3",
        borderRadius: "4px",
        overflow: "hidden",
        background: editorial.image ? `url(${editorial.image}) center/cover` : "#2A2620",
        display: "flex",
        alignItems: "flex-end",
        alignSelf: "start",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05) 60%)" }} />
      <div style={{ position: "relative", padding: "18px", color: "#fff" }}>
        <div style={{ fontSize: "9.5px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, opacity: 0.85 }}>
          {editorial.eyebrow || "Eyebrow"}
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "18px", lineHeight: 1.2, margin: "6px 0 10px" }}>
          {editorial.title || "Headline"}
        </div>
        {editorial.cta && (
          <div style={{ fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            {editorial.cta} →
          </div>
        )}
      </div>
    </div>
  );
}

function StorefrontPreview({
  menu,
  selectedId,
  onSelect,
}: {
  menu: NavMenu;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const visible = menu.departments.filter((d) => d.visible !== false && d.name.trim());
  const dept = menu.departments.find((d) => d.id === selectedId);
  const showPanel = dept && dept.type === "mega" && dept.visible !== false;
  const cols = dept ? dept.columns.map((c) => ({ ...c, items: c.items.filter((i) => i.visible !== false) })).filter((c) => c.items.length) : [];
  const showEditorial = !!dept && dept.editorial.visible !== false && !!dept.editorial.title;

  return (
    <div style={{ background: "#F3EFE8", color: "#15130F", borderRadius: "3px", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "26px",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(21,19,15,0.08)",
          flexWrap: "wrap",
        }}
      >
        {visible.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            style={{
              background: "none",
              border: "none",
              padding: "0 0 4px",
              cursor: "pointer",
              fontSize: "11.5px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: d.id === selectedId ? "var(--color-emerald)" : "#15130F",
              borderBottom: d.id === selectedId ? "1.5px solid var(--color-emerald)" : "1.5px solid transparent",
            }}
          >
            {d.name}
            {d.type === "mega" ? " ⌄" : ""}
          </button>
        ))}
      </div>

      {dept?.visible === false && (
        <div style={{ padding: "22px", fontSize: "12.5px", color: "rgba(21,19,15,0.5)" }}>
          “{dept.name}” is hidden, so it won't appear in the top bar.
        </div>
      )}

      {dept && dept.visible !== false && dept.type === "link" && (
        <div style={{ padding: "22px", fontSize: "12.5px", color: "rgba(21,19,15,0.5)" }}>
          “{dept.name}” is a plain link to <code>{dept.href}</code> — no dropdown.
        </div>
      )}

      {showPanel && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: showEditorial ? "1fr 240px" : "1fr",
            gap: "32px",
            padding: "24px 28px 28px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(21,19,15,0.1)",
                marginBottom: "16px",
              }}
            >
              {dept!.overviewLabel || `All ${dept!.name}`} →
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, cols.length)}, 1fr)`, gap: "24px" }}>
              {cols.map((c, ci) => (
                <div key={ci}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(21,19,15,0.5)", marginBottom: "10px" }}>
                    {c.title}
                  </div>
                  {c.items.map((it, ii) => (
                    <div key={ii} style={{ fontSize: "13px", padding: "4px 0", display: "flex", gap: "6px", alignItems: "center" }}>
                      {it.name}
                      {it.badge && (
                        <span
                          style={{
                            fontSize: "8.5px",
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            background: "rgba(31,92,66,0.1)",
                            color: "var(--color-emerald)",
                            padding: "2px 7px",
                            borderRadius: "10px",
                          }}
                        >
                          {it.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {showEditorial && <SpotlightPreview editorial={dept!.editorial} />}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* small controls                                                      */
/* ------------------------------------------------------------------ */
function SectionHead({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        borderBottom: "1px solid rgba(246,242,234,0.08)",
        paddingBottom: "12px",
        marginBottom: "20px",
      }}
    >
      <div>
        <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600 }}>{title}</h2>
        {hint && <div style={{ fontSize: "12px", color: "rgba(246,242,234,0.45)", marginTop: "2px" }}>{hint}</div>}
      </div>
      {action}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        width: "24px",
        height: "24px",
        fontSize: "12px",
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        color: danger ? "rgba(255,120,120,0.8)" : "rgba(246,242,234,0.7)",
        opacity: disabled ? 0.25 : 1,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{ display: "inline-flex", alignItems: "center", gap: "9px", background: "none", border: "none", color: "#F6F2EA", cursor: "pointer", padding: 0, fontSize: "12.5px" }}
    >
      <span
        style={{
          width: "34px",
          height: "18px",
          borderRadius: "10px",
          background: checked ? "var(--color-emerald)" : "rgba(246,242,234,0.15)",
          position: "relative",
          transition: "background 0.2s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "18px" : "2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#F6F2EA",
            transition: "left 0.2s ease",
          }}
        />
      </span>
      {label}
    </button>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "inline-flex", border: "1px solid rgba(246,242,234,0.15)", borderRadius: "2px", overflow: "hidden" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              background: active ? "#F6F2EA" : "#0F0E0B",
              color: active ? "#15130F" : "rgba(246,242,234,0.7)",
              border: "none",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* shared styles (match the other admin customizers)                   */
/* ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
  padding: "24px 28px",
  marginBottom: "24px",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "#64748B",
  marginBottom: "5px",
  textTransform: "uppercase",
  fontWeight: 600,
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  padding: "9px 12px",
  fontSize: "13px",
  borderRadius: "6px",
  outline: "none",
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
};

const inputSm: React.CSSProperties = {
  ...inputStyle,
  padding: "7px 10px",
  fontSize: "12.5px",
  background: "#FFFFFF",
};

const ghostBtn: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  color: "#334155",
  padding: "7px 14px",
  fontSize: "12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 500,
};
