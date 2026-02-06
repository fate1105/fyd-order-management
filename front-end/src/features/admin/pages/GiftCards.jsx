import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatVND } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import "../styles/gift-cards.css";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// SVG Icons
const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const GiftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
);

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

export default function GiftCards() {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [giftCards, setGiftCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        initialBalance: "",
        recipientEmail: "",
        recipientName: "",
        message: "",
        validityDays: 365,
    });

    const fetchGiftCards = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, size: 10 });
            if (search) params.append("search", search);

            const res = await fetch(`${API_BASE}/api/admin/gift-cards?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setGiftCards(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch {
            showToast(t("giftCards.loadError", "Không thể tải danh sách gift cards"), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGiftCards();
    }, [page, search]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/admin/gift-cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            showToast(t("giftCards.createSuccess", "Tạo gift card thành công!"), "success");
            setModalOpen(false);
            setForm({ initialBalance: "", recipientEmail: "", recipientName: "", message: "", validityDays: 365 });
            fetchGiftCards();
        } catch {
            showToast(t("giftCards.createError", "Lỗi khi tạo gift card"), "error");
        }
    };

    const handleCancel = async (id) => {
        if (!confirm(t("giftCards.cancelConfirm", "Bạn có chắc muốn hủy gift card này?"))) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/gift-cards/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!res.ok) throw new Error();
            showToast(t("giftCards.cancelSuccess", "Đã hủy gift card"), "success");
            fetchGiftCards();
        } catch {
            showToast(t("giftCards.cancelError", "Lỗi khi hủy gift card"), "error");
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        showToast(t("giftCards.copied", "Đã copy mã"), "success");
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    const getBalancePercent = (current, initial) => {
        if (!initial || initial === 0) return 0;
        return Math.round((current / initial) * 100);
    };

    return (
        <div className="gift-cards-page">
            {/* Header */}
            <div className="gc-header">
                <div className="gc-title-group">
                    <div className="gc-title-icon">
                        <GiftIcon />
                    </div>
                    <div>
                        <h1 className="gc-title">{t("giftCards.title", "Gift Cards")}</h1>
                        <p className="gc-subtitle">{t("giftCards.subtitle", "Quản lý thẻ quà tặng")}</p>
                    </div>
                </div>
                <button className="gc-create-btn" onClick={() => setModalOpen(true)}>
                    <PlusIcon />
                    <span>{t("giftCards.create", "Tạo Gift Card")}</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="gc-search-bar">
                <SearchIcon />
                <input
                    type="text"
                    placeholder={t("giftCards.searchPlaceholder", "Tìm mã, email, tên người nhận...")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Cards Container */}
            <div className="gc-cards-container">
                {loading ? (
                    <div className="gc-loading">{t("common.loading", "Đang tải...")}</div>
                ) : giftCards.length === 0 ? (
                    <div className="gc-empty-state">
                        <div className="gc-empty-icon">
                            <GiftIcon />
                        </div>
                        <h3 className="gc-empty-title">{t("giftCards.emptyTitle", "Chưa có gift card nào")}</h3>
                        <p className="gc-empty-desc">{t("giftCards.emptyDesc", "Tạo gift card đầu tiên để bắt đầu")}</p>
                        <button className="gc-empty-btn" onClick={() => setModalOpen(true)}>
                            <PlusIcon />
                            <span>{t("giftCards.createFirst", "Tạo ngay")}</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="gc-table">
                            <thead>
                                <tr>
                                    <th>{t("giftCards.code", "Mã")}</th>
                                    <th>{t("giftCards.balance", "Số dư")}</th>
                                    <th>{t("giftCards.recipient", "Người nhận")}</th>
                                    <th>{t("giftCards.status", "Trạng thái")}</th>
                                    <th>{t("giftCards.expires", "Hết hạn")}</th>
                                    <th>{t("giftCards.actions", "Thao tác")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {giftCards.map((gc) => (
                                    <tr key={gc.id}>
                                        <td>
                                            <div className="gc-code-cell">
                                                <span className="gc-code">{gc.code}</span>
                                                <button
                                                    className="gc-copy-btn"
                                                    onClick={() => copyToClipboard(gc.code)}
                                                    title="Copy"
                                                >
                                                    <CopyIcon />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="gc-balance">
                                                <span className="gc-balance-current">{formatVND(gc.currentBalance)}</span>
                                                {gc.currentBalance < gc.initialBalance && (
                                                    <span className="gc-balance-initial">/ {formatVND(gc.initialBalance)}</span>
                                                )}
                                                <div className="gc-balance-bar">
                                                    <div
                                                        className="gc-balance-bar-fill"
                                                        style={{ width: `${getBalancePercent(gc.currentBalance, gc.initialBalance)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="gc-recipient">
                                                <span className="gc-recipient-name">{gc.recipientName || "—"}</span>
                                                <span className="gc-recipient-email">{gc.recipientEmail || ""}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`gc-status ${gc.status?.toLowerCase()}`}>
                                                {gc.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="gc-expires">{formatDate(gc.expiresAt)}</span>
                                        </td>
                                        <td>
                                            <div className="gc-actions">
                                                {gc.status === "ACTIVE" && (
                                                    <button
                                                        className="gc-action-btn"
                                                        onClick={() => handleCancel(gc.id)}
                                                        title={t("giftCards.cancelBtn", "Hủy")}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="gc-pagination">
                                <button
                                    className="gc-page-btn"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeftIcon />
                                </button>
                                <span className="gc-page-info">
                                    {page + 1} / {totalPages}
                                </span>
                                <button
                                    className="gc-page-btn"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRightIcon />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Modal */}
            {modalOpen && createPortal(
                <div className="gc-modal-overlay" onMouseDown={() => setModalOpen(false)}>
                    <div className="gc-modal" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="gc-modal-header">
                            <h2 className="gc-modal-title">
                                <GiftIcon />
                                {t("giftCards.createTitle", "Tạo Gift Card Mới")}
                            </h2>
                            <button className="gc-modal-close" onClick={() => setModalOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="gc-modal-body">
                                <div className="gc-form-group">
                                    <label className="gc-form-label">{t("giftCards.amount", "Mệnh giá")} *</label>
                                    <div className="gc-amount-presets">
                                        {PRESET_AMOUNTS.map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                className={`gc-amount-btn ${form.initialBalance === amt ? "active" : ""}`}
                                                onClick={() => setForm({ ...form, initialBalance: amt })}
                                            >
                                                {formatVND(amt)}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        className="gc-form-input"
                                        placeholder={t("giftCards.customAmount", "Hoặc nhập số tiền khác")}
                                        value={form.initialBalance}
                                        onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="gc-form-row">
                                    <div className="gc-form-group">
                                        <label className="gc-form-label">{t("giftCards.recipientName", "Tên người nhận")}</label>
                                        <input
                                            type="text"
                                            className="gc-form-input"
                                            value={form.recipientName}
                                            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="gc-form-group">
                                        <label className="gc-form-label">{t("giftCards.recipientEmail", "Email")}</label>
                                        <input
                                            type="email"
                                            className="gc-form-input"
                                            value={form.recipientEmail}
                                            onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="gc-form-group">
                                    <label className="gc-form-label">{t("giftCards.message", "Lời nhắn")}</label>
                                    <textarea
                                        className="gc-form-input"
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder={t("giftCards.messagePlaceholder", "Chúc mừng sinh nhật!")}
                                        rows={3}
                                    />
                                </div>

                                <div className="gc-form-group">
                                    <label className="gc-form-label">{t("giftCards.validity", "Thời hạn (ngày)")}</label>
                                    <input
                                        type="number"
                                        className="gc-form-input"
                                        value={form.validityDays}
                                        onChange={(e) => setForm({ ...form, validityDays: parseInt(e.target.value) || 365 })}
                                    />
                                </div>
                            </div>

                            <div className="gc-modal-footer">
                                <button type="button" className="gc-btn-cancel" onClick={() => setModalOpen(false)}>
                                    {t("common.cancel", "Hủy")}
                                </button>
                                <button type="submit" className="gc-btn-submit" disabled={!form.initialBalance}>
                                    {t("giftCards.createBtn", "Tạo Gift Card")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
