import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatVND } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import "../styles/event-vouchers.css";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// SVG Icons
const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const CakeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
        <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
        <path d="M2 21h20" />
        <path d="M7 8v2" /><path d="M12 8v2" /><path d="M17 8v2" />
        <path d="M7 4h.01" /><path d="M12 4h.01" /><path d="M17 4h.01" />
    </svg>
);

const UserPlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
);

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CrownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <path d="M4 18h16v2H4z" />
    </svg>
);

const ShoppingBagIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
    </svg>
);

const PartyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const EVENT_TYPES = [
    { value: "BIRTHDAY", label: "Sinh nhật", icon: CakeIcon, color: "birthday" },
    { value: "NEW_USER", label: "Khách mới", icon: UserPlusIcon, color: "new-user" },
    { value: "INACTIVE", label: "Lâu không mua", icon: ClockIcon, color: "inactive" },
    { value: "VIP_TIER", label: "Đạt hạng VIP", icon: CrownIcon, color: "vip" },
    { value: "FIRST_ORDER", label: "Đơn đầu tiên", icon: ShoppingBagIcon, color: "first-order" },
    { value: "HOLIDAY", label: "Ngày lễ", icon: PartyIcon, color: "holiday" },
];

const getEventType = (value) => EVENT_TYPES.find((t) => t.value === value) || EVENT_TYPES[0];

export default function EventVouchers() {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        eventType: "BIRTHDAY",
        discountType: "PERCENT",
        discountValue: "",
        maxDiscount: "",
        minOrderAmount: "",
        validityDays: 30,
        inactiveDays: 30,
        newUserDays: 7,
        holidayDate: "",
        holidayName: "",
        targetTierId: "",
        eligibleTierIds: "",
        isActive: true,
        oncePerYear: true,
    });

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/event-vouchers`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setRules(Array.isArray(data) ? data : []);
        } catch {
            showToast(t("eventVouchers.loadError", "Không thể tải danh sách"), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            eventType: "BIRTHDAY",
            discountType: "PERCENT",
            discountValue: "",
            maxDiscount: "",
            minOrderAmount: "",
            validityDays: 30,
            inactiveDays: 30,
            newUserDays: 7,
            holidayDate: "",
            holidayName: "",
            targetTierId: "",
            eligibleTierIds: "",
            isActive: true,
            oncePerYear: true,
        });
        setEditingRule(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (rule) => {
        setEditingRule(rule);
        setForm({
            name: rule.name || "",
            description: rule.description || "",
            eventType: rule.eventType || "BIRTHDAY",
            discountType: rule.discountType || "PERCENT",
            discountValue: rule.discountValue || "",
            maxDiscount: rule.maxDiscount || "",
            minOrderAmount: rule.minOrderAmount || "",
            validityDays: rule.validityDays || 30,
            inactiveDays: rule.inactiveDays || 30,
            newUserDays: rule.newUserDays || 7,
            holidayDate: rule.holidayDate || "",
            holidayName: rule.holidayName || "",
            targetTierId: rule.targetTierId || "",
            eligibleTierIds: rule.eligibleTierIds || "",
            isActive: rule.isActive !== false,
            oncePerYear: rule.oncePerYear !== false,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingRule
                ? `${API_BASE}/api/admin/event-vouchers/${editingRule.id}`
                : `${API_BASE}/api/admin/event-vouchers`;
            const method = editingRule ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error();

            showToast(
                editingRule
                    ? t("eventVouchers.updateSuccess", "Cập nhật thành công!")
                    : t("eventVouchers.createSuccess", "Tạo quy tắc thành công!"),
                "success"
            );
            setModalOpen(false);
            resetForm();
            fetchRules();
        } catch {
            showToast(t("eventVouchers.saveError", "Lỗi khi lưu"), "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t("eventVouchers.deleteConfirm", "Bạn có chắc muốn xóa quy tắc này?"))) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/event-vouchers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!res.ok) throw new Error();
            showToast(t("eventVouchers.deleteSuccess", "Đã xóa quy tắc"), "success");
            fetchRules();
        } catch {
            showToast(t("eventVouchers.deleteError", "Lỗi khi xóa"), "error");
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/event-vouchers/${id}/toggle`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!res.ok) throw new Error();
            fetchRules();
        } catch {
            showToast(t("eventVouchers.toggleError", "Lỗi khi thay đổi trạng thái"), "error");
        }
    };

    const handleTrigger = async (id) => {
        if (!confirm(t("eventVouchers.triggerConfirm", "Tạo coupon cho tất cả khách hàng hợp lệ?"))) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/event-vouchers/${id}/trigger`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error();
            showToast(
                t("eventVouchers.triggerSuccess", `Đã tạo ${data.couponsGenerated || 0} coupon`),
                "success"
            );
            fetchRules();
        } catch {
            showToast(t("eventVouchers.triggerError", "Lỗi khi trigger"), "error");
        }
    };

    const formatDiscount = (rule) => {
        if (rule.discountType === "PERCENT") {
            return `${rule.discountValue}%`;
        }
        return formatVND(rule.discountValue);
    };

    const EventTypeIcon = ({ type }) => {
        const et = getEventType(type);
        const IconComponent = et.icon;
        return (
            <div className={`ev-rule-icon ev-type-icon ${et.color}`}>
                <IconComponent />
            </div>
        );
    };

    return (
        <div className="event-vouchers-page">
            {/* Header */}
            <div className="ev-header">
                <div className="ev-title-group">
                    <div className="ev-title-icon">
                        <CalendarIcon />
                    </div>
                    <div>
                        <h1 className="ev-title">{t("eventVouchers.title", "Event Vouchers")}</h1>
                        <p className="ev-subtitle">{t("eventVouchers.subtitle", "Tự động tạo coupon theo sự kiện")}</p>
                    </div>
                </div>
                <button className="ev-create-btn" onClick={openCreateModal}>
                    <PlusIcon />
                    <span>{t("eventVouchers.create", "Tạo quy tắc")}</span>
                </button>
            </div>

            {/* Rules Container */}
            <div className="ev-rules-container">
                {loading ? (
                    <div className="ev-loading">{t("common.loading", "Đang tải...")}</div>
                ) : rules.length === 0 ? (
                    <div className="ev-empty-state">
                        <div className="ev-empty-icon">
                            <CalendarIcon />
                        </div>
                        <h3 className="ev-empty-title">{t("eventVouchers.emptyTitle", "Chưa có quy tắc nào")}</h3>
                        <p className="ev-empty-desc">{t("eventVouchers.emptyDesc", "Tạo quy tắc để tự động phát coupon")}</p>
                    </div>
                ) : (
                    <table className="ev-table">
                        <thead>
                            <tr>
                                <th>{t("eventVouchers.name", "Tên quy tắc")}</th>
                                <th>{t("eventVouchers.discount", "Giảm giá")}</th>
                                <th>{t("eventVouchers.validity", "Hiệu lực")}</th>
                                <th>{t("eventVouchers.generated", "Đã tạo")}</th>
                                <th>{t("eventVouchers.status", "Trạng thái")}</th>
                                <th>{t("eventVouchers.actions", "Thao tác")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((rule) => (
                                <tr key={rule.id}>
                                    <td>
                                        <div className="ev-rule-name">
                                            <EventTypeIcon type={rule.eventType} />
                                            <div className="ev-rule-info">
                                                <span className="ev-rule-title">{rule.name}</span>
                                                <span className="ev-rule-desc">
                                                    {getEventType(rule.eventType).label}
                                                    {rule.holidayName && ` - ${rule.holidayName}`}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="ev-discount">{formatDiscount(rule)}</span>
                                    </td>
                                    <td>
                                        <span className="ev-stats">{rule.validityDays} ngày</span>
                                    </td>
                                    <td>
                                        <span className="ev-stats">{rule.couponsGenerated || 0} coupon</span>
                                    </td>
                                    <td>
                                        <div
                                            className={`ev-toggle ${rule.isActive ? "active" : ""}`}
                                            onClick={() => handleToggle(rule.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="ev-actions">
                                            <button
                                                className="ev-action-btn trigger"
                                                onClick={() => handleTrigger(rule.id)}
                                                title={t("eventVouchers.trigger", "Chạy ngay")}
                                            >
                                                <PlayIcon />
                                            </button>
                                            <button
                                                className="ev-action-btn"
                                                onClick={() => openEditModal(rule)}
                                                title={t("common.edit", "Sửa")}
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                className="ev-action-btn delete"
                                                onClick={() => handleDelete(rule.id)}
                                                title={t("common.delete", "Xóa")}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen &&
                createPortal(
                    <div className="ev-modal-overlay" onMouseDown={() => setModalOpen(false)}>
                        <div className="ev-modal" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="ev-modal-header">
                                <h2 className="ev-modal-title">
                                    <CalendarIcon />
                                    {editingRule
                                        ? t("eventVouchers.editTitle", "Sửa quy tắc")
                                        : t("eventVouchers.createTitle", "Tạo quy tắc mới")}
                                </h2>
                                <button className="ev-modal-close" onClick={() => setModalOpen(false)}>
                                    <CloseIcon />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="ev-modal-body">
                                    {/* Event Type Selector */}
                                    <div className="ev-form-group">
                                        <label className="ev-form-label">{t("eventVouchers.eventType", "Loại sự kiện")}</label>
                                        <div className="ev-type-selector">
                                            {EVENT_TYPES.map((et) => {
                                                const IconComponent = et.icon;
                                                return (
                                                    <div
                                                        key={et.value}
                                                        className={`ev-type-option ${form.eventType === et.value ? "selected" : ""}`}
                                                        onClick={() => setForm({ ...form, eventType: et.value })}
                                                    >
                                                        <div className={`ev-type-option-icon ev-type-icon ${et.color}`}>
                                                            <IconComponent />
                                                        </div>
                                                        <span className="ev-type-option-label">{et.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="ev-form-group">
                                        <label className="ev-form-label">{t("eventVouchers.ruleName", "Tên quy tắc")} *</label>
                                        <input
                                            type="text"
                                            className="ev-form-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder={t("eventVouchers.namePlaceholder", "VD: Ưu đãi sinh nhật 10%")}
                                            required
                                        />
                                    </div>

                                    {/* Conditional Fields */}
                                    {form.eventType === "HOLIDAY" && (
                                        <div className="ev-form-row">
                                            <div className="ev-form-group">
                                                <label className="ev-form-label">{t("eventVouchers.holidayDate", "Ngày (MM-DD)")}</label>
                                                <input
                                                    type="text"
                                                    className="ev-form-input"
                                                    value={form.holidayDate}
                                                    onChange={(e) => setForm({ ...form, holidayDate: e.target.value })}
                                                    placeholder="01-01"
                                                />
                                            </div>
                                            <div className="ev-form-group">
                                                <label className="ev-form-label">{t("eventVouchers.holidayName", "Tên lễ")}</label>
                                                <input
                                                    type="text"
                                                    className="ev-form-input"
                                                    value={form.holidayName}
                                                    onChange={(e) => setForm({ ...form, holidayName: e.target.value })}
                                                    placeholder="Tết Nguyên Đán"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {form.eventType === "INACTIVE" && (
                                        <div className="ev-form-group">
                                            <label className="ev-form-label">{t("eventVouchers.inactiveDays", "Không mua trong (ngày)")}</label>
                                            <input
                                                type="number"
                                                className="ev-form-input"
                                                value={form.inactiveDays}
                                                onChange={(e) => setForm({ ...form, inactiveDays: parseInt(e.target.value) || 30 })}
                                            />
                                        </div>
                                    )}

                                    {form.eventType === "NEW_USER" && (
                                        <div className="ev-form-group">
                                            <label className="ev-form-label">{t("eventVouchers.newUserDays", "Đăng ký trong (ngày)")}</label>
                                            <input
                                                type="number"
                                                className="ev-form-input"
                                                value={form.newUserDays}
                                                onChange={(e) => setForm({ ...form, newUserDays: parseInt(e.target.value) || 7 })}
                                            />
                                        </div>
                                    )}

                                    {/* Discount Settings */}
                                    <div className="ev-form-row-3">
                                        <div className="ev-form-group">
                                            <label className="ev-form-label">{t("eventVouchers.discountType", "Loại giảm")}</label>
                                            <select
                                                className="ev-form-select"
                                                value={form.discountType}
                                                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                            >
                                                <option value="PERCENT">Phần trăm (%)</option>
                                                <option value="FIXED">Số tiền cố định</option>
                                            </select>
                                        </div>
                                        <div className="ev-form-group">
                                            <label className="ev-form-label">{t("eventVouchers.discountValue", "Giá trị")} *</label>
                                            <input
                                                type="number"
                                                className="ev-form-input"
                                                value={form.discountValue}
                                                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                                placeholder={form.discountType === "PERCENT" ? "10" : "50000"}
                                                required
                                            />
                                        </div>
                                        <div className="ev-form-group">
                                            <label className="ev-form-label">{t("eventVouchers.maxDiscount", "Giảm tối đa")}</label>
                                            <input
                                                type="number"
                                                className="ev-form-input"
                                                value={form.maxDiscount}
                                                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                                                placeholder="100000"
                                            />
                                        </div>
                                    </div>

                                    <div className="ev-form-row">
                                        <div className="ev-form-group">
                                            <label className="ev-form-label">{t("eventVouchers.minOrder", "Đơn tối thiểu")}</label>
                                            <input
                                                type="number"
                                                className="ev-form-input"
                                                value={form.minOrderAmount}
                                                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="ev-form-group">
                                            <label className="ev-form-label">{t("eventVouchers.validityDays", "Hiệu lực (ngày)")}</label>
                                            <input
                                                type="number"
                                                className="ev-form-input"
                                                value={form.validityDays}
                                                onChange={(e) => setForm({ ...form, validityDays: parseInt(e.target.value) || 30 })}
                                            />
                                        </div>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="ev-form-row">
                                        <div className="ev-checkbox-group">
                                            <input
                                                type="checkbox"
                                                className="ev-checkbox"
                                                checked={form.isActive}
                                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            />
                                            <span className="ev-checkbox-label">{t("eventVouchers.isActive", "Kích hoạt")}</span>
                                        </div>
                                        <div className="ev-checkbox-group">
                                            <input
                                                type="checkbox"
                                                className="ev-checkbox"
                                                checked={form.oncePerYear}
                                                onChange={(e) => setForm({ ...form, oncePerYear: e.target.checked })}
                                            />
                                            <span className="ev-checkbox-label">{t("eventVouchers.oncePerYear", "1 lần/năm")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="ev-modal-footer">
                                    <button type="button" className="ev-btn-cancel" onClick={() => setModalOpen(false)}>
                                        {t("common.cancel", "Hủy")}
                                    </button>
                                    <button type="submit" className="ev-btn-submit" disabled={!form.name || !form.discountValue}>
                                        {editingRule ? t("common.save", "Lưu") : t("eventVouchers.createBtn", "Tạo quy tắc")}
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
