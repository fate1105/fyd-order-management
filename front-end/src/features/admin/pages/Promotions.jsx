import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { promotionAPI, formatVND } from "@shared/utils/api.js";
import "../styles/dashboard.css";
import "../styles/pages.css";
import "../styles/promotions.css";

// SVG Icons
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const TagIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <circle cx="7" cy="7" r="1.5" />
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const PauseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </svg>
);

const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EmptyIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <circle cx="7" cy="7" r="1.5" />
    </svg>
);

function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return createPortal(
        <div className="modalBackdrop" onMouseDown={onClose}>
            <div className="modal" style={{ maxWidth: 600 }} onMouseDown={(e) => e.stopPropagation()}>
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

const emptyForm = {
    code: "",
    name: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
};

export default function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [q, setQ] = useState("");

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            setLoading(true);
            const data = await promotionAPI.getAll();
            setPromotions(data || []);
        } catch (err) {
            console.error("Failed to load promotions:", err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (promo) => {
        setEditingId(promo.id);
        setForm({
            code: promo.code || "",
            name: promo.name || "",
            description: promo.description || "",
            discountType: promo.discountType || "PERCENT",
            discountValue: String(promo.discountValue || ""),
            minOrderAmount: String(promo.minOrderAmount || ""),
            maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : "",
            usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
            startDate: promo.startDate ? promo.startDate.slice(0, 16) : "",
            endDate: promo.endDate ? promo.endDate.slice(0, 16) : "",
            isActive: promo.isActive !== false,
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.name.trim() || !form.discountValue) {
            alert("Vui lòng nhập mã, tên và giá trị giảm giá");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                name: form.name.trim(),
                description: form.description.trim(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
                maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
                isActive: form.isActive,
            };

            if (editingId) {
                await promotionAPI.update(editingId, payload);
            } else {
                await promotionAPI.create(payload);
            }

            setModalOpen(false);
            loadPromotions();
        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;
        try {
            await promotionAPI.delete(id);
            loadPromotions();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    };

    const toggleActive = async (promo) => {
        try {
            await promotionAPI.update(promo.id, { ...promo, isActive: !promo.isActive });
            loadPromotions();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    };

    const filtered = promotions.filter((p) => {
        const text = `${p.code} ${p.name}`.toLowerCase();
        return !q || text.includes(q.toLowerCase());
    });

    const getStatusBadge = (promo) => {
        if (!promo.isActive) return { cls: "paused", label: "Tạm dừng" };
        const now = new Date();
        if (promo.startDate && new Date(promo.startDate) > now) return { cls: "pending", label: "Sắp bắt đầu" };
        if (promo.endDate && new Date(promo.endDate) < now) return { cls: "expired", label: "Hết hạn" };
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return { cls: "expired", label: "Hết lượt" };
        return { cls: "active", label: "Đang hoạt động" };
    };

    if (loading) {
        return (
            <div className="promo-card">
                <div className="promo-header">
                    <div className="promo-header-left">
                        <div className="promo-icon"><TagIcon /></div>
                        <div>
                            <h1 className="promo-title">Khuyến mãi</h1>
                            <p className="promo-subtitle">Đang tải...</p>
                        </div>
                    </div>
                </div>
                <div className="promo-loading">
                    <div className="promo-spinner"></div>
                    <span>Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="promo-card">
            {/* Header */}
            <div className="promo-header">
                <div className="promo-header-left">
                    <div className="promo-icon"><TagIcon /></div>
                    <div>
                        <h1 className="promo-title">Khuyến mãi</h1>
                        <p className="promo-subtitle">{promotions.length} mã khuyến mãi</p>
                    </div>
                </div>

                <div className="promo-header-right">
                    <div className="promo-search">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Tìm theo mã hoặc tên..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                    <button className="promo-btn-primary" type="button" onClick={openAdd}>
                        <PlusIcon />
                        <span>Tạo mã mới</span>
                    </button>
                </div>
            </div>

            {/* Header Divider */}
            <div className="promo-divider"></div>

            {/* Table Header */}
            <div className="promo-table-header">
                <div className="promo-col promo-col-code">Mã</div>
                <div className="promo-col promo-col-name">Tên chương trình</div>
                <div className="promo-col promo-col-discount">Giảm giá</div>
                <div className="promo-col promo-col-min">Đơn tối thiểu</div>
                <div className="promo-col promo-col-usage">Lượt dùng</div>
                <div className="promo-col promo-col-status">Trạng thái</div>
                <div className="promo-col promo-col-actions">Hành động</div>
            </div>

            {/* Promotion List */}
            <div className="promo-list">
                {filtered.map((promo) => {
                    const status = getStatusBadge(promo);
                    return (
                        <div key={promo.id} className="promo-row">
                            <div className="promo-col promo-col-code">
                                <span className="promo-code-badge">{promo.code}</span>
                            </div>
                            <div className="promo-col promo-col-name">
                                <span className="promo-name">{promo.name}</span>
                                {promo.description && (
                                    <span className="promo-desc">{promo.description}</span>
                                )}
                            </div>
                            <div className="promo-col promo-col-discount">
                                <span className="promo-discount-value">
                                    {promo.discountType === "PERCENT"
                                        ? `${promo.discountValue}%`
                                        : formatVND(promo.discountValue)}
                                </span>
                                {promo.maxDiscount && promo.discountType === "PERCENT" && (
                                    <span className="promo-max-discount">
                                        tối đa {formatVND(promo.maxDiscount)}
                                    </span>
                                )}
                            </div>
                            <div className="promo-col promo-col-min">
                                {promo.minOrderAmount ? formatVND(promo.minOrderAmount) : "—"}
                            </div>
                            <div className="promo-col promo-col-usage">
                                <span className="promo-usage">
                                    {promo.usedCount || 0}
                                    {promo.usageLimit && (
                                        <span className="promo-usage-limit">/{promo.usageLimit}</span>
                                    )}
                                </span>
                            </div>
                            <div className="promo-col promo-col-status">
                                <span className={`promo-status-badge ${status.cls}`}>
                                    {status.label}
                                </span>
                            </div>
                            <div className="promo-col promo-col-actions">
                                <div className="promo-actions">
                                    <button
                                        className="promo-action-btn"
                                        type="button"
                                        onClick={() => openEdit(promo)}
                                        title="Sửa"
                                    >
                                        <EditIcon />
                                        <span>Sửa</span>
                                    </button>
                                    <button
                                        className="promo-action-btn"
                                        type="button"
                                        onClick={() => toggleActive(promo)}
                                        title={promo.isActive ? "Tạm dừng" : "Kích hoạt"}
                                    >
                                        {promo.isActive ? <PauseIcon /> : <PlayIcon />}
                                        <span>{promo.isActive ? "Tắt" : "Bật"}</span>
                                    </button>
                                    <button
                                        className="promo-action-btn danger"
                                        type="button"
                                        onClick={() => handleDelete(promo.id)}
                                        title="Xóa"
                                    >
                                        <TrashIcon />
                                        <span>Xóa</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {filtered.length === 0 && (
                    <div className="promo-empty">
                        <div className="promo-empty-icon"><EmptyIcon /></div>
                        <h3>Chưa có mã khuyến mãi nào</h3>
                        <p>Bắt đầu tạo mã khuyến mãi đầu tiên để thu hút khách hàng</p>
                        <button className="promo-btn-primary" type="button" onClick={openAdd}>
                            <PlusIcon />
                            <span>Tạo mã mới</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                open={modalOpen}
                title={editingId ? "Sửa khuyến mãi" : "Tạo khuyến mãi mới"}
                onClose={() => setModalOpen(false)}
            >
                <div className="formGrid">
                    <label className="field">
                        <span>Mã khuyến mãi *</span>
                        <input
                            value={form.code}
                            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                            placeholder="VD: SUMMER2024"
                            disabled={!!editingId}
                        />
                    </label>
                    <label className="field">
                        <span>Tên khuyến mãi *</span>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="VD: Giảm giá mùa hè"
                        />
                    </label>
                    <label className="field full">
                        <span>Mô tả</span>
                        <input
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="VD: Áp dụng cho đơn hàng từ 500k"
                        />
                    </label>
                    <label className="field">
                        <span>Loại giảm giá *</span>
                        <select
                            value={form.discountType}
                            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                        >
                            <option value="PERCENT">Phần trăm (%)</option>
                            <option value="FIXED">Số tiền cố định (VND)</option>
                        </select>
                    </label>
                    <label className="field">
                        <span>Giá trị giảm *</span>
                        <input
                            type="number"
                            value={form.discountValue}
                            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                            placeholder={form.discountType === "PERCENT" ? "VD: 10" : "VD: 50000"}
                        />
                    </label>
                    <label className="field">
                        <span>Đơn tối thiểu (VND)</span>
                        <input
                            type="number"
                            value={form.minOrderAmount}
                            onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                            placeholder="VD: 500000"
                        />
                    </label>
                    {form.discountType === "PERCENT" && (
                        <label className="field">
                            <span>Giảm tối đa (VND)</span>
                            <input
                                type="number"
                                value={form.maxDiscount}
                                onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                                placeholder="VD: 100000"
                            />
                        </label>
                    )}
                    <label className="field">
                        <span>Giới hạn sử dụng</span>
                        <input
                            type="number"
                            value={form.usageLimit}
                            onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                            placeholder="Để trống = không giới hạn"
                        />
                    </label>
                    <label className="field">
                        <span>Bắt đầu</span>
                        <input
                            type="datetime-local"
                            value={form.startDate}
                            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                        />
                    </label>
                    <label className="field">
                        <span>Kết thúc</span>
                        <input
                            type="datetime-local"
                            value={form.endDate}
                            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                        />
                    </label>
                    <label className="field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                            style={{ width: 18, height: 18 }}
                        />
                        <span>Kích hoạt</span>
                    </label>
                </div>

                <div className="modalActions">
                    <button className="btnGhost" type="button" onClick={() => setModalOpen(false)}>
                        Hủy
                    </button>
                    <button className="btnPrimary" type="button" onClick={handleSave} disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
