import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { categoryAPI, brandAPI } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import { useConfirm } from "@shared/context/ConfirmContext";
import { useTranslation } from "react-i18next";
import "../styles/dashboard.css";
import "../styles/pages.css";

// SVG Icons
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return createPortal(
        <div className="modalBackdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modalHead">
                    <div className="modalTitle">{title}</div>
                    <button className="iconBtn" type="button" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modalBody">{children}</div>
            </div>
        </div>,
        document.body
    );
}

function StatusBadge({ status }) {
    const { t } = useTranslation();
    if (status === "ACTIVE") return <span className="pill ok">{t("common.active")}</span>;
    return <span className="pill cancel">{t("common.inactive")}</span>;
}

// Empty forms
const emptyCategoryForm = { name: "", slug: "", description: "", parentId: "", sortOrder: 0, status: "ACTIVE" };
const emptyBrandForm = { name: "", slug: "", description: "", logoUrl: "", status: "ACTIVE" };

export default function Categories() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("categories");

    return (
        <div className="card">
            <div className="cardHead">
                <div>
                    <div className="cardTitle">{t("categories.title")}</div>
                    <div className="cardSub">{t("categories.subtitle")}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="chips" style={{ marginBottom: 20 }}>
                <button
                    className={`chip ${activeTab === "categories" ? "on" : ""}`}
                    onClick={() => setActiveTab("categories")}
                    type="button"
                >
                    {t("common.categories")}
                </button>
                <button
                    className={`chip ${activeTab === "brands" ? "on" : ""}`}
                    onClick={() => setActiveTab("brands")}
                    type="button"
                >
                    {t("brands.title")}
                </button>
            </div>

            {activeTab === "categories" ? <CategoriesTab /> : <BrandsTab />}
        </div>
    );
}

function CategoriesTab() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyCategoryForm);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();
    const { showConfirm } = useConfirm();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const data = await categoryAPI.getFlat();
            setCategories(data || []);
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setLoading(false);
        }
    }

    const editing = useMemo(
        () => categories.find((c) => c.id === editingId) || null,
        [categories, editingId]
    );

    const filtered = useMemo(() => {
        return categories.filter((c) => {
            const text = `${c.name || ""} ${c.slug || ""} ${c.description || ""}`.toLowerCase();
            return !q || text.includes(q.toLowerCase());
        });
    }, [categories, q]);

    function openAdd() {
        setEditingId(null);
        setForm(emptyCategoryForm);
        setEditOpen(true);
    }

    function openEdit(c) {
        setEditingId(c.id);
        setForm({
            name: c.name || "",
            slug: c.slug || "",
            description: c.description || "",
            parentId: c.parentId ? String(c.parentId) : "",
            sortOrder: c.sortOrder || 0,
            status: c.status || "ACTIVE",
        });
        setEditOpen(true);
    }

    async function save() {
        if (!form.name) {
            showToast(t("categories.validate_error"), "error");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                slug: form.slug || undefined,
                description: form.description || undefined,
                parentId: form.parentId ? Number(form.parentId) : null,
                sortOrder: Number(form.sortOrder) || 0,
                status: form.status,
            };

            if (editingId) {
                await categoryAPI.update(editingId, payload);
            } else {
                await categoryAPI.create(payload);
            }
            await loadData();
            setEditOpen(false);
            showToast(editingId ? t("products.msg_update_success") : t("products.msg_save_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        } finally {
            setSaving(false);
        }
    }

    async function deleteItem(c) {
        if (!(await showConfirm(t("common.confirm_delete_title"), t("categories.delete_confirm", { name: c.name })))) return;
        try {
            await categoryAPI.delete(c.id);
            await loadData();
            showToast(t("products.msg_delete_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        }
    }

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                {t("common.loading")}
            </div>
        );
    }

    return (
        <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: "space-between" }}>
                <input
                    className="miniInput"
                    placeholder={t("categories.search_placeholder")}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ flex: 1, maxWidth: 300 }}
                />
                <button className="btnPrimary" type="button" onClick={openAdd}>
                    {t("categories.btn_add")}
                </button>
            </div>

            <div className="table">
                <div className="tr th">
                    <div>{t("categories.col_name")}</div>
                    <div>{t("categories.col_slug")}</div>
                    <div>{t("categories.col_parent")}</div>
                    <div>{t("categories.col_status")}</div>
                    <div>{t("categories.col_action")}</div>
                </div>
                {filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
                        {t("categories.empty")}
                    </div>
                ) : (
                    filtered.map((c) => {
                        const parent = categories.find((p) => p.id === c.parentId);
                        return (
                            <div className="tr" key={c.id}>
                                <div style={{ fontWeight: 600 }}>{c.name}</div>
                                <div className="mono" style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                                    {c.slug || "—"}
                                </div>
                                <div style={{ color: "var(--admin-text-muted)" }}>{parent?.name || "—"}</div>
                                <div>
                                    <StatusBadge status={c.status} />
                                </div>
                                <div className="rowActions">
                                    <button className="linkBtn" type="button" onClick={() => openEdit(c)}>
                                        {t("common.edit")}
                                    </button>
                                    <button
                                        className="linkBtn"
                                        type="button"
                                        onClick={() => deleteItem(c)}
                                        style={{ color: "var(--admin-error)" }}
                                    >
                                        {t("common.delete")}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Modal
                open={editOpen}
                title={editing ? t("categories.modal_edit", { name: editing.name }) : t("categories.modal_add")}
                onClose={() => setEditOpen(false)}
            >
                <div className="formGrid">
                    <label className="field">
                        <span>{t("categories.label_name")}</span>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="VD: Áo thun"
                        />
                    </label>
                    <label className="field">
                        <span>{t("categories.label_slug")}</span>
                        <input
                            value={form.slug}
                            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                            placeholder={`ao-thun ${t("categories.slug_hint")}`}
                        />
                    </label>
                    <label className="field">
                        <span>{t("categories.label_parent")}</span>
                        <select
                            value={form.parentId}
                            onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                            className="form-select"
                        >
                            <option value="">{t("categories.no_parent")}</option>
                            {categories
                                .filter((c) => c.id !== editingId)
                                .map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                        </select>
                    </label>
                    <label className="field">
                        <span>{t("categories.label_order")}</span>
                        <input
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                            placeholder="0"
                        />
                    </label>
                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span>{t("categories.label_desc")}</span>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="..."
                            rows={2}
                            style={{
                                width: "100%",
                                resize: "vertical",
                                fontFamily: "inherit",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid var(--admin-border)",
                                background: "var(--glass-bg)",
                                color: "var(--admin-text)",
                            }}
                        />
                    </label>
                    <label className="field">
                        <span>{t("categories.label_status")}</span>
                        <select
                            value={form.status}
                            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                            className="form-select"
                        >
                            <option value="ACTIVE">{t("common.active")}</option>
                            <option value="INACTIVE">{t("common.inactive")}</option>
                        </select>
                    </label>
                </div>
                <div className="modalActions">
                    <button className="btnGhost" type="button" onClick={() => setEditOpen(false)}>
                        {t("common.cancel")}
                    </button>
                    <button className="btnPrimary" type="button" onClick={save} disabled={saving}>
                        {saving ? t("products.gallery_saving") : editing ? t("common.save") : t("common.add")}
                    </button>
                </div>
            </Modal>
        </>
    );
}

function BrandsTab() {
    const { t } = useTranslation();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyBrandForm);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();
    const { showConfirm } = useConfirm();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const data = await brandAPI.getAll();
            setBrands(data || []);
        } catch (error) {
            console.error("Failed to load brands:", error);
        } finally {
            setLoading(false);
        }
    }

    const editing = useMemo(
        () => brands.find((b) => b.id === editingId) || null,
        [brands, editingId]
    );

    const filtered = useMemo(() => {
        return brands.filter((b) => {
            const text = `${b.name || ""} ${b.slug || ""} ${b.description || ""}`.toLowerCase();
            return !q || text.includes(q.toLowerCase());
        });
    }, [brands, q]);

    function openAdd() {
        setEditingId(null);
        setForm(emptyBrandForm);
        setEditOpen(true);
    }

    function openEdit(b) {
        setEditingId(b.id);
        setForm({
            name: b.name || "",
            slug: b.slug || "",
            description: b.description || "",
            logoUrl: b.logoUrl || "",
            status: b.status || "ACTIVE",
        });
        setEditOpen(true);
    }

    async function save() {
        if (!form.name) {
            showToast(t("brands.validate_error"), "error");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                slug: form.slug || undefined,
                description: form.description || undefined,
                logoUrl: form.logoUrl || undefined,
                status: form.status,
            };

            if (editingId) {
                await brandAPI.update(editingId, payload);
            } else {
                await brandAPI.create(payload);
            }
            await loadData();
            setEditOpen(false);
            showToast(editingId ? t("products.msg_update_success") : t("products.msg_save_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        } finally {
            setSaving(false);
        }
    }

    async function deleteItem(b) {
        if (!(await showConfirm(t("common.confirm_delete_title"), t("brands.delete_confirm", { name: b.name })))) return;
        try {
            await brandAPI.delete(b.id);
            await loadData();
            showToast(t("products.msg_delete_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        }
    }

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                {t("common.loading")}
            </div>
        );
    }

    return (
        <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: "space-between" }}>
                <input
                    className="miniInput"
                    placeholder={t("brands.search_placeholder")}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ flex: 1, maxWidth: 300 }}
                />
                <button className="btnPrimary" type="button" onClick={openAdd}>
                    {t("brands.btn_add")}
                </button>
            </div>

            <div className="table">
                <div className="tr th">
                    <div>{t("brands.col_name")}</div>
                    <div>{t("categories.col_slug")}</div>
                    <div>{t("brands.col_desc")}</div>
                    <div>{t("categories.col_status")}</div>
                    <div>{t("categories.col_action")}</div>
                </div>
                {filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
                        {t("brands.empty")}
                    </div>
                ) : (
                    filtered.map((b) => {
                        return (
                            <div className="tr" key={b.id}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {b.logoUrl ? (
                                        <img
                                            src={b.logoUrl}
                                            alt={b.name}
                                            style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 4,
                                                background: "var(--admin-accent-gradient)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700,
                                                fontSize: 14,
                                                color: "#0a0a0f",
                                            }}
                                        >
                                            {(b.name || "?").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                                </div>
                                <div className="mono" style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                                    {b.slug || "—"}
                                </div>
                                <div
                                    style={{
                                        color: "var(--admin-text-muted)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: 200,
                                    }}
                                >
                                    {b.description || "—"}
                                </div>
                                <div>
                                    <StatusBadge status={b.status} />
                                </div>
                                <div className="rowActions">
                                    <button className="linkBtn" type="button" onClick={() => openEdit(b)}>
                                        {t("common.edit")}
                                    </button>
                                    <button
                                        className="linkBtn"
                                        type="button"
                                        onClick={() => deleteItem(b)}
                                        style={{ color: "var(--admin-error)" }}
                                    >
                                        {t("common.delete")}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Modal
                open={editOpen}
                title={editing ? t("brands.modal_edit", { name: editing.name }) : t("brands.modal_add")}
                onClose={() => setEditOpen(false)}
            >
                <div className="formGrid">
                    <label className="field">
                        <span>{t("brands.label_name")}</span>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="VD: Nike"
                        />
                    </label>
                    <label className="field">
                        <span>{t("categories.label_slug")}</span>
                        <input
                            value={form.slug}
                            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                            placeholder={`nike ${t("categories.slug_hint")}`}
                        />
                    </label>
                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span>{t("brands.label_logo")}</span>
                        <input
                            value={form.logoUrl}
                            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                            placeholder="https://..."
                        />
                    </label>
                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span>{t("categories.label_desc")}</span>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="..."
                            rows={2}
                            style={{
                                width: "100%",
                                resize: "vertical",
                                fontFamily: "inherit",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid var(--admin-border)",
                                background: "var(--glass-bg)",
                                color: "var(--admin-text)",
                            }}
                        />
                    </label>
                    <label className="field">
                        <span>{t("categories.label_status")}</span>
                        <select
                            value={form.status}
                            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                            className="form-select"
                        >
                            <option value="ACTIVE">{t("common.active")}</option>
                            <option value="INACTIVE">{t("common.inactive")}</option>
                        </select>
                    </label>
                </div>
                <div className="modalActions">
                    <button className="btnGhost" type="button" onClick={() => setEditOpen(false)}>
                        {t("common.cancel")}
                    </button>
                    <button className="btnPrimary" type="button" onClick={save} disabled={saving}>
                        {saving ? t("products.gallery_saving") : editing ? t("common.save") : t("common.add")}
                    </button>
                </div>
            </Modal>
        </>
    );
}
