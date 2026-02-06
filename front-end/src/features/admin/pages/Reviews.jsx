import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { reviewAPI } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import "../styles/dashboard.css";
import "../styles/pages.css";
import { useTranslation } from "react-i18next";

// SVG Icons
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const StarIcon = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function StarRating({ rating }) {
    return (
        <div style={{ display: "flex", gap: 2, color: "var(--admin-warning)" }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= rating} />
            ))}
        </div>
    );
}

export default function Reviews() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pendingCount, setPendingCount] = useState(0);
    const [selected, setSelected] = useState([]);

    const [replyOpen, setReplyOpen] = useState(false);
    const [replyReview, setReplyReview] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    function statusBadge(status) {
        if (status === "APPROVED") return { cls: "ok", label: t("status.approved") };
        if (status === "REJECTED") return { cls: "cancel", label: t("status.rejected") };
        return { cls: "pending", label: t("status.pending") };
    }

    function formatDate(dateStr) {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        const locale = t("common.locale_tag") || "vi-VN";
        try {
            return d.toLocaleDateString(locale, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (e) {
            return d.toLocaleString();
        }
    }

    useEffect(() => {
        loadData();
    }, [statusFilter, q]);

    async function loadData() {
        setLoading(true);
        try {
            const params = { q, status: statusFilter !== "all" ? statusFilter : "" };
            const data = await reviewAPI.getAll(params);
            setReviews(data.reviews || []);
            setPendingCount(data.pendingCount || 0);
        } catch (error) {
            console.error("Failed to load reviews:", error);
        } finally {
            setLoading(false);
        }
    }

    // Status counts
    const statusCounts = useMemo(() => {
        const counts = { all: reviews.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
        reviews.forEach((r) => {
            if (r.status) counts[r.status] = (counts[r.status] || 0) + 1;
        });
        counts.PENDING = pendingCount; // Use server count for pending
        return counts;
    }, [reviews, pendingCount]);

    async function updateStatus(review, status) {
        try {
            await reviewAPI.updateStatus(review.id, status);
            await loadData();
            showToast(t("common.update_success"));
        } catch (error) {
            showToast(error.message || t("common.error_occurred"), "error");
        }
    }

    async function deleteReview(review) {
        if (!window.confirm(t("reviews.delete_confirm"))) return;
        try {
            await reviewAPI.delete(review.id);
            await loadData();
            showToast(t("reviews.msg_delete_success"));
        } catch (error) {
            showToast(error.message || t("common.error_occurred"), "error");
        }
    }

    function openReply(review) {
        setReplyReview(review);
        setReplyText(review.adminReply || "");
        setReplyOpen(true);
    }

    async function saveReply() {
        if (!replyText.trim()) {
            showToast(t("reviews.label_reply_content") + " " + t("common.required"), "error");
            return;
        }
        setSaving(true);
        try {
            await reviewAPI.reply(replyReview.id, replyText);
            setReplyOpen(false);
            await loadData();
            showToast(t("reviews.msg_reply_success"));
        } catch (error) {
            showToast(error.message || t("common.error_occurred"), "error");
        } finally {
            setSaving(false);
        }
    }

    function toggleSelect(id) {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }

    async function bulkApprove() {
        if (selected.length === 0) return;
        try {
            await reviewAPI.bulkApprove(selected);
            setSelected([]);
            await loadData();
            showToast(t("common.approved_count", { count: selected.length }));
        } catch (error) {
            showToast(error.message || t("common.error_occurred"), "error");
        }
    }

    if (loading) {
        return (
            <div className="card">
                <div className="cardHead">
                    <div className="cardTitle">{t("reviews.title")}</div>
                </div>
                <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                    {t("common.loading_data")}...
                </div>
            </div>
        );
    }

    const reviewHeaderT = t("reviews.title").toLowerCase();

    return (
        <div className="card">
            <div className="cardHead">
                <div>
                    <div className="cardTitle">{t("reviews.title")}</div>
                    <div className="cardSub">
                        {reviews.length} {reviewHeaderT} • {pendingCount} {t("status.pending").toLowerCase()}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
                    <div className="promo-search" style={{ margin: 0 }}>
                        <SearchIcon />
                        <input
                            placeholder={t("common.search_placeholder")}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                    {selected.length > 0 && (
                        <button className="btnPrimary" type="button" onClick={bulkApprove}>
                            <CheckIcon />
                            {t("status.approved")} ({selected.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Status Filter Chips */}
            <div className="chips" style={{ marginBottom: 16 }}>
                <button
                    className={`chip ${statusFilter === "all" ? "on" : ""}`}
                    onClick={() => setStatusFilter("all")}
                    type="button"
                >
                    {t("status.all")} ({statusCounts.all || 0})
                </button>
                <button
                    className={`chip ${statusFilter === "PENDING" ? "on" : ""}`}
                    onClick={() => setStatusFilter("PENDING")}
                    type="button"
                >
                    <ClockIcon />
                    {t("status.pending")} ({pendingCount})
                </button>
                <button
                    className={`chip ${statusFilter === "APPROVED" ? "on" : ""}`}
                    onClick={() => setStatusFilter("APPROVED")}
                    type="button"
                >
                    <CheckIcon />
                    {t("status.approved")} ({statusCounts.APPROVED || 0})
                </button>
                <button
                    className={`chip ${statusFilter === "REJECTED" ? "on" : ""}`}
                    onClick={() => setStatusFilter("REJECTED")}
                    type="button"
                >
                    <XIcon />
                    {t("status.rejected")} ({statusCounts.REJECTED || 0})
                </button>
            </div>

            {/* Reviews List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviews.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
                        {t("common.empty_state")}
                    </div>
                ) : (
                    reviews.map((r) => {
                        const badge = statusBadge(r.status);
                        const isSelected = selected.includes(r.id);
                        return (
                            <div
                                key={r.id}
                                style={{
                                    background: isSelected ? "rgba(var(--admin-accent-rgb), 0.1)" : "var(--glass-bg)",
                                    border: `1px solid ${isSelected ? "var(--admin-accent)" : "var(--admin-border)"}`,
                                    borderRadius: "var(--admin-radius-md)",
                                    padding: 16,
                                }}
                            >
                                {/* Header */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: 12,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(r.id)}
                                            style={{ width: 18, height: 18 }}
                                        />
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                background: "var(--admin-accent-gradient)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700,
                                                fontSize: 16,
                                                color: "#0a0a0f",
                                            }}
                                        >
                                            {(r.customerName || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                                                {r.customerName}
                                                {r.isVerifiedPurchase && (
                                                    <span
                                                        style={{
                                                            fontSize: 10,
                                                            background: "var(--admin-success-bg)",
                                                            color: "var(--admin-success)",
                                                            padding: "2px 6px",
                                                            borderRadius: 4,
                                                        }}
                                                    >
                                                        <CheckIcon /> {t("common.verified_purchase", "Đã mua")}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                                                {formatDate(r.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`pill ${badge.cls}`}>{badge.label}</span>
                                </div>

                                {/* Product info */}
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "var(--admin-text-muted)",
                                        marginBottom: 8,
                                        display: "flex",
                                        gap: 8,
                                    }}
                                >
                                    <span>{t("reviews.col_product")}:</span>
                                    <span style={{ color: "var(--admin-accent)" }}>{r.productName}</span>
                                    <span className="mono">({r.productSku})</span>
                                </div>

                                {/* Rating and content */}
                                <div style={{ marginBottom: 12 }}>
                                    <StarRating rating={r.rating} />
                                    {r.title && (
                                        <div style={{ fontWeight: 600, marginTop: 8 }}>{r.title}</div>
                                    )}
                                    <div style={{ marginTop: 4, color: "var(--admin-text)", lineHeight: 1.5 }}>
                                        {r.content || `(${t("common.empty_description")})`}
                                    </div>
                                </div>

                                {/* Admin reply */}
                                {r.adminReply && (
                                    <div
                                        style={{
                                            background: "rgba(var(--admin-accent-rgb), 0.05)",
                                            border: "1px solid rgba(var(--admin-accent-rgb), 0.2)",
                                            borderRadius: 8,
                                            padding: 12,
                                            marginBottom: 12,
                                        }}
                                    >
                                        <div style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 4 }}>
                                            {t("reviews.label_reply_content")} • {formatDate(r.adminReplyAt)}
                                        </div>
                                        <div style={{ color: "var(--admin-text)" }}>{r.adminReply}</div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="rowActions" style={{ justifyContent: "flex-end" }}>
                                    {r.status === "PENDING" && (
                                        <>
                                            <button
                                                className="linkBtn"
                                                type="button"
                                                onClick={() => updateStatus(r, "APPROVED")}
                                                style={{ color: "var(--admin-success)" }}
                                            >
                                                <CheckIcon /> {t("common.approve")}
                                            </button>
                                            <button
                                                className="linkBtn"
                                                type="button"
                                                onClick={() => updateStatus(r, "REJECTED")}
                                                style={{ color: "var(--admin-error)" }}
                                            >
                                                <XIcon /> {t("common.reject")}
                                            </button>
                                        </>
                                    )}
                                    <button className="linkBtn" type="button" onClick={() => openReply(r)}>
                                        {t("reviews.btn_reply")}
                                    </button>
                                    <button
                                        className="linkBtn"
                                        type="button"
                                        onClick={() => deleteReview(r)}
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

            {/* Reply Modal */}
            <Modal
                open={replyOpen}
                title={`${t("reviews.modal_reply")} • ${replyReview?.customerName || ""}`}
                onClose={() => setReplyOpen(false)}
            >
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginBottom: 8 }}>
                        {t("reviews.col_comment")}:
                    </div>
                    <div
                        style={{
                            background: "var(--glass-bg)",
                            border: "1px solid var(--admin-border)",
                            borderRadius: 8,
                            padding: 12,
                        }}
                    >
                        <StarRating rating={replyReview?.rating || 0} />
                        <div style={{ marginTop: 8 }}>{replyReview?.content || `(${t("common.empty_description")})`}</div>
                    </div>
                </div>
                <label className="field" style={{ display: "block" }}>
                    <span>{t("reviews.label_reply_content")} *</span>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="..."
                        rows={4}
                        style={{
                            width: "100%",
                            resize: "vertical",
                            fontFamily: "inherit",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--admin-border)",
                            background: "var(--glass-bg)",
                            color: "var(--admin-text)",
                            marginTop: 8,
                        }}
                    />
                </label>
                <div className="modalActions">
                    <button className="btnGhost" type="button" onClick={() => setReplyOpen(false)}>
                        {t("common.cancel")}
                    </button>
                    <button className="btnPrimary" type="button" onClick={saveReply} disabled={saving}>
                        {saving ? t("common.sending") + "..." : t("reviews.btn_reply")}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
