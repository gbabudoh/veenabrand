"use client";

import React, { useState, useEffect } from "react";

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
  background: "#0F0E0B",
  border: "1px solid rgba(246,242,234,0.15)",
  color: "#F6F2EA",
  padding: "10px 12px",
  fontSize: "13.5px",
  borderRadius: "2px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "rgba(246,242,234,0.5)",
  marginBottom: "6px",
  textTransform: "uppercase",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  const openCreateForm = () => {
    resetForm();
    setIsBulk(false);
    setIsEditing(false);
    setIsCreating(true);
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

  // Bulk paste: one category per line. An indented line (tab or 2+ spaces)
  // becomes a child of the nearest preceding unindented line.
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

  // Roots first, each followed by its children, so the table reads as a tree.
  const ordered: Category[] = [];
  const roots = categories.filter((c) => !c.parentId);
  for (const root of roots) {
    ordered.push(root);
    ordered.push(...categories.filter((c) => c.parentId === root.id));
  }
  // Anything whose parent is missing from the list still gets shown.
  for (const c of categories) {
    if (!ordered.includes(c)) ordered.push(c);
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "34px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
            Categories
          </h1>
          <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
            The taxonomy behind the storefront navbar and the collection filters
          </div>
        </div>
        {!isCreating && !isEditing && !isBulk && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { closeForms(); setIsBulk(true); }}
              style={{ background: "none", color: "rgba(246,242,234,0.75)", border: "1px solid rgba(246,242,234,0.2)", padding: "9px 18px", fontSize: "12.5px", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
            >
              Bulk Add
            </button>
            <button
              onClick={openCreateForm}
              style={{ background: "var(--color-emerald)", color: "#F6F2EA", border: "none", padding: "9px 18px", fontSize: "12.5px", borderRadius: "2px", cursor: "pointer", fontWeight: 600, letterSpacing: "0.03em" }}
            >
              + New Category
            </button>
          </div>
        )}
      </div>

      {/* Bulk add */}
      {isBulk && (
        <div style={{ background: "#15130F", border: "1px solid rgba(246, 242, 234, 0.08)", borderRadius: "4px", padding: "30px", marginBottom: "32px", maxWidth: "680px" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", margin: "0 0 8px", fontWeight: 500 }}>
            Bulk Add Categories
          </h2>
          <p style={{ fontSize: "12.5px", color: "rgba(246,242,234,0.5)", margin: "0 0 20px", lineHeight: 1.6 }}>
            One category per line. Indent a line (tab or two spaces) to make it a sub-category
            of the line above it.
          </p>

          <form onSubmit={handleBulkSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Categories</label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={10}
                required
                placeholder={"Dresses\n  Maxi\n  Midi\nOuterwear\n  Coats\nTrousers"}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}
              />
            </div>

            <div style={{ marginBottom: "16px", maxWidth: "260px" }}>
              <label style={labelStyle}>Apply Gender To All</label>
              <select value={bulkGender} onChange={(e) => setBulkGender(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Both (shared)</option>
                <option value="WOMEN">Women only</option>
                <option value="MEN">Men only</option>
              </select>
            </div>

            {error && <div style={{ color: "#e5793f", fontSize: "12.5px", marginBottom: "14px" }}>{error}</div>}

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={busy} style={{ background: "#F6F2EA", color: "#15130F", border: "none", padding: "11px 24px", fontSize: "12.5px", cursor: busy ? "wait" : "pointer", borderRadius: "2px", fontWeight: 600, opacity: busy ? 0.6 : 1 }}>
                {busy ? "Adding…" : "Add All"}
              </button>
              <button type="button" onClick={closeForms} style={{ background: "none", color: "rgba(246,242,234,0.6)", border: "1px solid rgba(246,242,234,0.15)", padding: "11px 24px", fontSize: "12.5px", cursor: "pointer", borderRadius: "2px" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / edit form */}
      {(isCreating || isEditing) && (
        <div style={{ background: "#15130F", border: "1px solid rgba(246, 242, 234, 0.08)", borderRadius: "4px", padding: "30px", marginBottom: "32px", maxWidth: "680px" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", margin: "0 0 20px", fontWeight: 500 }}>
            {isCreating ? "New Category" : `Edit: ${name}`}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Category Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dresses" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Description (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: "none" }} />
            </div>

            <div>
              <label style={labelStyle}>Parent Category</label>
              <select value={parentId} onChange={(e) => setParentId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— Top level —</option>
                {categories
                  .filter((c) => c.id !== categoryId && !c.parentId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Gender Scope</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Both (shared)</option>
                <option value="WOMEN">Women only</option>
                <option value="MEN">Men only</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Sort Order</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", paddingBottom: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "rgba(246,242,234,0.75)", cursor: "pointer" }}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: "#1F5C42", width: "15px", height: "15px" }} />
                Active
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "rgba(246,242,234,0.75)", cursor: "pointer" }}>
                <input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} style={{ accentColor: "#1F5C42", width: "15px", height: "15px" }} />
                In navbar
              </label>
            </div>

            {error && <div style={{ gridColumn: "span 2", color: "#e5793f", fontSize: "12.5px" }}>{error}</div>}

            <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", marginTop: "14px" }}>
              <button type="submit" disabled={busy} style={{ background: "#F6F2EA", color: "#15130F", border: "none", padding: "11px 24px", fontSize: "12.5px", cursor: busy ? "wait" : "pointer", borderRadius: "2px", fontWeight: 600, opacity: busy ? 0.6 : 1 }}>
                {isCreating ? "Create Category" : "Save Changes"}
              </button>
              <button type="button" onClick={closeForms} style={{ background: "none", color: "rgba(246,242,234,0.6)", border: "1px solid rgba(246,242,234,0.15)", padding: "11px 24px", fontSize: "12.5px", cursor: "pointer", borderRadius: "2px" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category table */}
      <div style={{ background: "#15130F", border: "1px solid rgba(246, 242, 234, 0.08)", borderRadius: "4px", padding: "24px" }}>
        {loading ? (
          <div style={{ color: "rgba(246,242,234,0.5)" }}>Loading categories…</div>
        ) : ordered.length === 0 ? (
          <div style={{ color: "rgba(246,242,234,0.4)", lineHeight: 1.7 }}>
            No categories yet. Use <strong style={{ color: "rgba(246,242,234,0.7)" }}>Bulk Add</strong> to paste your
            full list in one go, or create them one at a time.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left", minWidth: "760px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(246,242,234,0.08)" }}>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Category</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Slug</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Gender</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Products</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Visibility</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(246,242,234,0.04)", opacity: c.active ? 1 : 0.45 }}>
                    <td style={{ padding: "14px 10px", fontWeight: c.parentId ? 400 : 600, paddingLeft: c.parentId ? "34px" : "10px" }}>
                      {c.parentId && <span style={{ color: "rgba(246,242,234,0.3)", marginRight: "8px" }}>└</span>}
                      {c.name}
                    </td>
                    <td style={{ padding: "14px 10px", color: "rgba(246,242,234,0.45)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {c.slug}
                    </td>
                    <td style={{ padding: "14px 10px", color: "rgba(246,242,234,0.6)" }}>
                      {c.gender || "Both"}
                    </td>
                    <td style={{ padding: "14px 10px", color: "rgba(246,242,234,0.6)" }}>
                      {c._count.products}
                    </td>
                    <td style={{ padding: "14px 10px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => toggleField(c, "active")}
                          title="Toggle whether this category appears anywhere on the storefront"
                          style={{
                            background: c.active ? "rgba(31,92,66,0.35)" : "rgba(246,242,234,0.05)",
                            border: "none", color: c.active ? "#7fd1a8" : "rgba(246,242,234,0.4)",
                            padding: "3px 9px", borderRadius: "999px", fontSize: "11px", cursor: "pointer",
                          }}
                        >
                          {c.active ? "Active" : "Hidden"}
                        </button>
                        <button
                          onClick={() => toggleField(c, "showInNav")}
                          title="Toggle whether this category appears in the navbar"
                          style={{
                            background: "rgba(246,242,234,0.05)", border: "none",
                            color: c.showInNav ? "rgba(246,242,234,0.75)" : "rgba(246,242,234,0.3)",
                            padding: "3px 9px", borderRadius: "999px", fontSize: "11px", cursor: "pointer",
                          }}
                        >
                          {c.showInNav ? "In nav" : "Off nav"}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "14px 10px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => openEditForm(c)}
                        style={{ background: "none", border: "none", color: "var(--color-emerald)", cursor: "pointer", fontWeight: 600, marginRight: "14px", fontSize: "13px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        style={{ background: "none", border: "none", color: "rgba(229,121,63,0.9)", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
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
    </div>
  );
}
