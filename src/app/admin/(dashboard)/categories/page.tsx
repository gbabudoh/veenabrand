"use client";

import React, { useState, useEffect, useMemo } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  gender: string | null;
  parentId: string | null;
  sortOrder: number;
  active: boolean;
  showInNav: boolean;
  parent: { id: string; name: string } | null;
  _count: { products: number; children: number };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  padding: "9px 12px",
  fontSize: "13.5px",
  borderRadius: "6px",
  outline: "none",
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<"ALL" | "WOMEN" | "MEN" | "ACCESSORIES" | "LIFESTYLE" | "BESPOKE">("ALL");
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [showInNav, setShowInNav] = useState(true);

  const [bulkText, setBulkText] = useState("");
  const [bulkGender, setBulkGender] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setCategoryId("");
    setName("");
    setDescription("");
    setGender("");
    setParentId("");
    setSortOrder("0");
    setActive(true);
    setShowInNav(true);
    setError("");
  };

  const openCreateForm = (prefillParentId?: string) => {
    resetForm();
    setIsBulk(false);
    setIsEditing(false);
    setIsCreating(true);
    if (prefillParentId) {
      setParentId(prefillParentId);
      const parentCat = categories.find((c) => c.id === prefillParentId);
      if (parentCat?.gender) setGender(parentCat.gender);
    }
    setSortOrder(String(categories.length));
  };

  const openEditForm = (c: Category) => {
    setError("");
    setIsBulk(false);
    setIsCreating(false);
    setIsEditing(true);
    setCategoryId(c.id);
    setName(c.name);
    setDescription(c.description || "");
    setGender(c.gender || "");
    setParentId(c.parentId || "");
    setSortOrder(String(c.sortOrder));
    setActive(c.active);
    setShowInNav(c.showInNav);
  };

  const closeForms = () => {
    setIsCreating(false);
    setIsEditing(false);
    setIsBulk(false);
    setError("");
  };

  const toggleCollapse = (id: string) => {
    setCollapsedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setCollapsedParents({});
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    categories.filter((c) => !c.parentId).forEach((r) => {
      all[r.id] = true;
    });
    setCollapsedParents(all);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const payload = {
      name,
      description,
      gender: gender || null,
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      active,
      showInNav,
    };

    try {
      const res = await fetch("/api/admin/categories", {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCreating ? payload : { id: categoryId, ...payload }),
      });
      const data = await res.json();

      if (res.ok) {
        closeForms();
        resetForm();
        await fetchCategories();
      } else {
        setError(data.error || "Save failed");
      }
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (c: Category) => {
    const warnings: string[] = [];
    if (c._count.products) {
      warnings.push(`${c._count.products} product(s) will become uncategorised`);
    }
    if (c._count.children) {
      warnings.push(`${c._count.children} sub-categor${c._count.children === 1 ? "y" : "ies"} will move to the top level`);
    }

    const message = warnings.length
      ? `Delete "${c.name}"?\n\n${warnings.join("\n")}.\n\nNo products are deleted.`
      : `Delete "${c.name}"?`;

    if (!confirm(message)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${c.id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleField = async (c: Category, field: "active" | "showInNav") => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, [field]: !c[field] }),
      });
      if (res.ok) await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const lines = bulkText.split("\n").filter((l) => l.trim());
    let currentParentId: string | null = null;
    let created = 0;
    let failed = 0;

    for (const [i, line] of lines.entries()) {
      const isChild = /^(\t|\s{2,})/.test(line);
      const label = line.trim();

      try {
        const res: Response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: label,
            gender: bulkGender || null,
            parentId: isChild ? currentParentId : null,
            sortOrder: categories.length + i,
          }),
        });
        const data: any = await res.json();
        if (res.ok) {
          created++;
          if (!isChild) currentParentId = data.category.id;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    setBusy(false);
    setBulkText("");
    closeForms();
    await fetchCategories();

    if (failed) setError(`Added ${created} categor${created === 1 ? "y" : "ies"}, ${failed} failed.`);
  };

  // Hierarchy building
  const rootCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  const subCategoriesByParent = useMemo(() => {
    const map: Record<string, Category[]> = {};
    for (const c of categories) {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    }
    return map;
  }, [categories]);

  const totalProductsMapped = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);
  }, [categories]);

  const totalSubCategoriesCount = useMemo(() => {
    return categories.filter((c) => Boolean(c.parentId)).length;
  }, [categories]);

  // Filtered Roots
  const filteredRoots = useMemo(() => {
    return rootCategories.filter((root) => {
      const term = searchTerm.toLowerCase();
      const children = subCategoriesByParent[root.id] || [];

      // Check if root or any children match search term
      const matchesSearch =
        !term ||
        root.name.toLowerCase().includes(term) ||
        root.slug.toLowerCase().includes(term) ||
        children.some((ch) => ch.name.toLowerCase().includes(term) || ch.slug.toLowerCase().includes(term));

      // Department filter
      const matchesDept =
        departmentFilter === "ALL" ||
        (departmentFilter === "WOMEN" && (root.slug === "women" || root.gender === "WOMEN")) ||
        (departmentFilter === "MEN" && (root.slug === "men" || root.gender === "MEN")) ||
        (departmentFilter === "ACCESSORIES" && root.slug === "accessories") ||
        (departmentFilter === "LIFESTYLE" && root.slug === "lifestyle") ||
        (departmentFilter === "BESPOKE" && (root.slug === "bespoke" || root.slug === "bespoke-favorite"));

      return matchesSearch && matchesDept;
    });
  }, [rootCategories, subCategoriesByParent, searchTerm, departmentFilter]);

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "26px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
              Merchandising Taxonomy &amp; Categories
            </h1>
            <span style={{ fontSize: "11.5px", color: "#065F46", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "2px 9px", borderRadius: "999px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
              Live Storefront Mega-Nav
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "#64748B" }}>
            Structure your storefront hierarchy with parent departments and nested sub-category taxonomies
          </div>
        </div>

        {/* Quick Actions & Header Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Summary Telemetry Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#64748B",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          }}>
            <span><strong style={{ color: "#0F172A" }}>{rootCategories.length}</strong> Departments</span>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <span><strong style={{ color: "#2563EB" }}>{totalSubCategoriesCount}</strong> Sub-categories</span>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <span><strong style={{ color: "#059669" }}>{totalProductsMapped}</strong> Products</span>
          </div>

          {!isCreating && !isEditing && !isBulk && (
            <>
              <button
                type="button"
                onClick={() => { closeForms(); setIsBulk(true); }}
                style={{
                  background: "#FFFFFF",
                  color: "#334155",
                  border: "1px solid #CBD5E1",
                  padding: "8px 14px",
                  fontSize: "12.5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  transition: "all 0.15s ease",
                }}
              >
                Bulk Import
              </button>
              <button
                type="button"
                onClick={() => openCreateForm()}
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 16px",
                  fontSize: "12.5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Department</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        {/* Search Bar */}
        <div style={{ position: "relative", minWidth: "280px" }}>
          <input
            type="text"
            placeholder="Search departments or sub-categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...inputStyle,
              padding: "8px 12px 8px 34px",
              width: "320px",
              fontSize: "12.5px",
            }}
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: "11px", top: "11px" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Department Tabs & Accordion Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Department Tabs */}
          <div style={{
            display: "inline-flex",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            padding: "2px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          }}>
            {(["ALL", "WOMEN", "MEN", "ACCESSORIES", "LIFESTYLE", "BESPOKE"] as const).map((d) => {
              const isSelected = departmentFilter === d;
              const labels = {
                ALL: "All",
                WOMEN: "Women",
                MEN: "Men",
                ACCESSORIES: "Accessories",
                LIFESTYLE: "Lifestyle",
                BESPOKE: "Bespoke",
              };
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepartmentFilter(d)}
                  style={{
                    background: isSelected ? "#0F172A" : "transparent",
                    color: isSelected ? "#FFFFFF" : "#64748B",
                    border: "none",
                    padding: "5px 12px",
                    borderRadius: "4px",
                    fontSize: "11.5px",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {labels[d]}
                </button>
              );
            })}
          </div>

          {/* Quick Collapse / Expand Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={expandAll}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#475569",
                fontSize: "11.5px",
                padding: "6px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#475569",
                fontSize: "11.5px",
                padding: "6px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Add Modal Card */}
      {isBulk && (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          padding: "26px",
          marginBottom: "28px",
          maxWidth: "680px",
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
              Bulk Hierarchy Import
            </h2>
            <button
              type="button"
              onClick={closeForms}
              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 18px", lineHeight: 1.5 }}>
            Enter one category per line. Indent a line with two spaces or a tab to configure it as a sub-category under the line above it.
          </p>

          <form onSubmit={handleBulkSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Category Tree Text</label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={8}
                required
                placeholder={"Women\n  Dresses\n  Trousers\n  Bubu\nMen\n  Sartorial Suits\n  Shirts"}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}
              />
            </div>

            <div style={{ marginBottom: "20px", maxWidth: "260px" }}>
              <label style={labelStyle}>Default Gender Segment</label>
              <select value={bulkGender} onChange={(e) => setBulkGender(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Both (Shared / Unisex)</option>
                <option value="WOMEN">Women's Atelier</option>
                <option value="MEN">Men's Sartorial</option>
              </select>
            </div>

            {error && <div style={{ color: "#DC2626", fontSize: "12.5px", marginBottom: "14px" }}>{error}</div>}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={busy}
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "9px 20px",
                  fontSize: "12.5px",
                  cursor: busy ? "wait" : "pointer",
                  borderRadius: "6px",
                  fontWeight: 600,
                  opacity: busy ? 0.6 : 1,
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
                }}
              >
                {busy ? "Processing..." : "Import Tree"}
              </button>
              <button
                type="button"
                onClick={closeForms}
                style={{
                  background: "#FFFFFF",
                  color: "#64748B",
                  border: "1px solid #CBD5E1",
                  padding: "9px 20px",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Form Card */}
      {(isCreating || isEditing) && (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          padding: "26px",
          marginBottom: "28px",
          maxWidth: "680px",
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
                {isCreating ? (parentId ? "Add Sub-Category" : "New Department Category") : `Edit Category: ${name}`}
              </h2>
              {parentId && (
                <div style={{ fontSize: "12px", color: "#2563EB", fontWeight: 500, marginTop: "2px" }}>
                  Parent: {categories.find((c) => c.id === parentId)?.name}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={closeForms}
              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Category Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Silk Bubu Dresses" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Description (Optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: "none" }} placeholder="Brief customer merchandising overview..." />
            </div>

            <div>
              <label style={labelStyle}>Parent Department</label>
              <select value={parentId} onChange={(e) => setParentId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— Top-level Department —</option>
                {rootCategories
                  .filter((c) => c.id !== categoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Gender Scope</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Both (Shared / Unisex)</option>
                <option value="WOMEN">Women's</option>
                <option value="MEN">Men's</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Sort Order (Index)</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", paddingTop: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", cursor: "pointer", fontWeight: 500 }}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: "#0F172A", width: "16px", height: "16px" }} />
                Active on Storefront
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", cursor: "pointer", fontWeight: 500 }}>
                <input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} style={{ accentColor: "#0F172A", width: "16px", height: "16px" }} />
                Show in Mega Nav
              </label>
            </div>

            {error && <div style={{ gridColumn: "span 2", color: "#DC2626", fontSize: "12.5px" }}>{error}</div>}

            <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                type="submit"
                disabled={busy}
                style={{
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "9px 22px",
                  fontSize: "12.5px",
                  cursor: busy ? "wait" : "pointer",
                  borderRadius: "6px",
                  fontWeight: 600,
                  opacity: busy ? 0.6 : 1,
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
                }}
              >
                {isCreating ? "Confirm & Create" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={closeForms}
                style={{
                  background: "#FFFFFF",
                  color: "#64748B",
                  border: "1px solid #CBD5E1",
                  padding: "9px 20px",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================
          HIERARCHICAL ACCORDION & DEPARTMENT CARD GRID (CLEAN UX)
          =================================================================== */}
      {loading ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "40px", textAlign: "center", color: "#64748B" }}>
          Querying categories taxonomy...
        </div>
      ) : filteredRoots.length === 0 ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "48px 24px", textAlign: "center", color: "#94A3B8" }}>
          No department categories match your search filters.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredRoots.map((root) => {
            const children = subCategoriesByParent[root.id] || [];
            const isCollapsed = Boolean(collapsedParents[root.id]);
            const totalDeptProducts = (root._count?.products || 0) + children.reduce((acc, ch) => acc + (ch._count?.products || 0), 0);

            return (
              <div
                key={root.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
                  transition: "border-color 0.15s ease",
                }}
              >
                {/* Department Header Row */}
                <div style={{
                  padding: "16px 20px",
                  background: isCollapsed ? "#FFFFFF" : "#F8FAFC",
                  borderBottom: isCollapsed ? "none" : "1px solid #E2E8F0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}>
                  {/* Left: Expand toggle, Name, Badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Expand/Collapse Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(root.id)}
                      title={isCollapsed ? "Expand Sub-categories" : "Collapse Sub-categories"}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        borderRadius: "5px",
                        width: "26px",
                        height: "26px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#475569",
                        fontSize: "10px",
                        fontWeight: 700,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isCollapsed ? "▶" : "▼"}
                    </button>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "15.5px", fontWeight: 700, color: "#0F172A" }}>
                          {root.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748B", fontFamily: "var(--font-mono)", background: "#F1F5F9", padding: "1px 6px", borderRadius: "3px" }}>
                          /{root.slug}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px", fontSize: "11.5px", color: "#64748B" }}>
                        <span>
                          <strong style={{ color: "#0F172A" }}>{children.length}</strong> {children.length === 1 ? "Sub-category" : "Sub-categories"}
                        </span>
                        <span>•</span>
                        <span>
                          <strong style={{ color: "#059669" }}>{totalDeptProducts}</strong> Products Mapped
                        </span>
                        <span>•</span>
                        <span style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: 600, color: "#475569", background: "#E2E8F0", padding: "1px 6px", borderRadius: "3px" }}>
                          {root.gender || "Shared"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Visibility Pills & Quick Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Visibility Toggles */}
                    <button
                      type="button"
                      onClick={() => toggleField(root, "active")}
                      title="Click to toggle storefront visibility"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: root.active ? "#ECFDF5" : "#F8FAFC",
                        border: `1px solid ${root.active ? "#A7F3D0" : "#CBD5E1"}`,
                        color: root.active ? "#065F46" : "#64748B",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: root.active ? "#10B981" : "#94A3B8" }} />
                      {root.active ? "Active" : "Hidden"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleField(root, "showInNav")}
                      title="Click to toggle mega navbar inclusion"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        background: root.showInNav ? "#EFF6FF" : "#F8FAFC",
                        border: `1px solid ${root.showInNav ? "#BFDBFE" : "#E2E8F0"}`,
                        color: root.showInNav ? "#1D4ED8" : "#94A3B8",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {root.showInNav ? "In Navbar" : "Off Nav"}
                    </button>

                    <span style={{ color: "#E2E8F0" }}>|</span>

                    {/* Quick Add Sub-Category Button */}
                    <button
                      type="button"
                      onClick={() => openCreateForm(root.id)}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        color: "#0F172A",
                        padding: "5px 11px",
                        borderRadius: "5px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>+ Add Sub-category</span>
                    </button>

                    {/* Edit Department */}
                    <button
                      type="button"
                      onClick={() => openEditForm(root)}
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #CBD5E1",
                        color: "#334155",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    {/* Delete Department */}
                    <button
                      type="button"
                      onClick={() => handleDelete(root)}
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Sub-Categories Nested List (Rendered when not collapsed) */}
                {!isCollapsed && (
                  <div>
                    {children.length === 0 ? (
                      <div style={{ padding: "20px", textAlign: "center", background: "#FFFFFF", color: "#94A3B8", fontSize: "12.5px" }}>
                        No sub-categories configured under <strong>{root.name}</strong> yet. Click{" "}
                        <button
                          type="button"
                          onClick={() => openCreateForm(root.id)}
                          style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
                        >
                          + Add Sub-category
                        </button>{" "}
                        to create the first nested category.
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "#FFFFFF", borderBottom: "1px solid #F1F5F9" }}>
                              <th style={{ padding: "8px 20px", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Sub-Category</th>
                              <th style={{ padding: "8px 14px", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Slug Destination</th>
                              <th style={{ padding: "8px 14px", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Products</th>
                              <th style={{ padding: "8px 14px", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}>Visibility Status</th>
                              <th style={{ padding: "8px 20px", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", fontWeight: 600, textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {children.map((child, cIdx) => (
                              <tr
                                key={child.id}
                                style={{
                                  borderBottom: cIdx === children.length - 1 ? "none" : "1px solid #F8FAFC",
                                  background: cIdx % 2 === 0 ? "#FFFFFF" : "#FCFDFF",
                                  transition: "background 0.1s ease",
                                }}
                              >
                                {/* Name with Branch Connector */}
                                <td style={{ padding: "10px 20px", fontWeight: 500, color: "#0F172A" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ color: "#CBD5E1", fontSize: "14px" }}>↳</span>
                                    <span style={{ fontWeight: 600 }}>{child.name}</span>
                                    {child.description && (
                                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>({child.description})</span>
                                    )}
                                  </div>
                                </td>

                                {/* Slug */}
                                <td style={{ padding: "10px 14px", color: "#64748B", fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
                                  /{child.slug}
                                </td>

                                {/* Products Count */}
                                <td style={{ padding: "10px 14px" }}>
                                  <span style={{
                                    fontSize: "11.5px",
                                    fontWeight: 600,
                                    color: child._count.products > 0 ? "#0F172A" : "#94A3B8",
                                    background: child._count.products > 0 ? "#F1F5F9" : "transparent",
                                    padding: child._count.products > 0 ? "2px 7px" : "0",
                                    borderRadius: "4px",
                                  }}>
                                    {child._count.products} {child._count.products === 1 ? "item" : "items"}
                                  </span>
                                </td>

                                {/* Visibility Pills */}
                                <td style={{ padding: "10px 14px" }}>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      type="button"
                                      onClick={() => toggleField(child, "active")}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        background: child.active ? "#ECFDF5" : "#F8FAFC",
                                        border: `1px solid ${child.active ? "#A7F3D0" : "#E2E8F0"}`,
                                        color: child.active ? "#065F46" : "#94A3B8",
                                        padding: "2px 7px",
                                        borderRadius: "999px",
                                        fontSize: "10.5px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: child.active ? "#10B981" : "#CBD5E1" }} />
                                      {child.active ? "Active" : "Hidden"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => toggleField(child, "showInNav")}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        background: child.showInNav ? "#EFF6FF" : "#F8FAFC",
                                        border: `1px solid ${child.showInNav ? "#BFDBFE" : "#E2E8F0"}`,
                                        color: child.showInNav ? "#1D4ED8" : "#94A3B8",
                                        padding: "2px 7px",
                                        borderRadius: "999px",
                                        fontSize: "10.5px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {child.showInNav ? "In Nav" : "Off Nav"}
                                    </button>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td style={{ padding: "10px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                                  <button
                                    type="button"
                                    onClick={() => openEditForm(child)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#2563EB",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      marginRight: "12px",
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(child)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#EF4444",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
