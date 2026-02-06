import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { pointsAPI, formatVND } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import "../styles/dashboard.css";
import "../styles/pages.css";
import "../styles/tiers.css";
import { useTranslation } from "react-i18next";

// SVG Icons
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const AwardIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const UsersIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const RuleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const CheckIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return createPortal(
        <div className="modalBackdrop" onMouseDown={onClose}>
            <div className="modal" style={{ maxWidth: 500 }} onMouseDown={(e) => e.stopPropagation()}>
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

const getTierIcon = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("bronze")) return "🥉";
    if (n.includes("silver")) return "🥈";
    if (n.includes("gold")) return "🥇";
    if (n.includes("platinum")) return "💎";
    return "🏆";
};

const getTierClass = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("bronze")) return "tier-bronze";
    if (n.includes("silver")) return "tier-silver";
    if (n.includes("gold")) return "tier-gold";
    if (n.includes("platinum")) return "tier-platinum";
    return "";
};

export default function Tiers() {
    const { t } = useTranslation();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [form, setForm] = useState({
        name: "",
        minPoints: "",
        discountPercent: "",
        benefits: "",
        sortOrder: ""
    });
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    // Generate structured benefits based on tier level
    const getTierBenefits = (tier) => {
        const n = (tier.name || "").toLowerCase();
        const discount = tier.discountPercent || 0;

        const benefits = [];

        // Primary benefit: Discount
        if (discount > 0) {
            benefits.push({
                type: "discount",
                text: t("tiers.benefit_discount", { percent: discount }),
                primary: true
            });
        }

        // Shipping benefit based on tier
        if (n.includes("bronze")) {
            benefits.push({ type: "shipping", text: t("tiers.benefit_ship_bronze") });
            benefits.push({ type: "points", text: t("tiers.benefit_point_bronze") });
        } else if (n.includes("silver")) {
            benefits.push({ type: "shipping", text: t("tiers.benefit_ship_silver") });
            benefits.push({ type: "points", text: t("tiers.benefit_point_silver") });
            benefits.push({ type: "birthday", text: t("tiers.benefit_birthday") });
        } else if (n.includes("gold")) {
            benefits.push({ type: "shipping", text: t("tiers.benefit_ship_gold_plat") });
            benefits.push({ type: "points", text: t("tiers.benefit_point_gold") });
            benefits.push({ type: "birthday", text: t("tiers.benefit_birthday_special") });
            benefits.push({ type: "early", text: t("tiers.benefit_access_early") });
        } else if (n.includes("platinum")) {
            benefits.push({ type: "shipping", text: t("tiers.benefit_ship_gold_plat") });
            benefits.push({ type: "points", text: t("tiers.benefit_point_plat") });
            benefits.push({ type: "birthday", text: t("tiers.benefit_birthday_vip") });
            benefits.push({ type: "early", text: t("tiers.benefit_access_early_48") });
            benefits.push({ type: "support", text: t("tiers.benefit_support_priority") });
        }

        // Add custom benefits from database
        if (tier.benefits && tier.benefits.trim()) {
            benefits.push({ type: "custom", text: tier.benefits });
        }

        return benefits;
    };

    useEffect(() => {
        loadTiers();
    }, []);

    const loadTiers = async () => {
        try {
            setLoading(true);
            // Use getTierStats to get real member counts
            const data = await pointsAPI.getTierStats();
            // Sort by sortOrder to ensure correct progression
            const sorted = (data || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            setTiers(sorted);
        } catch (err) {
            console.error("Failed to load tiers:", err);
            // Fallback to basic getTiers if stats endpoint fails
            try {
                const fallbackData = await pointsAPI.getTiers();
                const sorted = (fallbackData || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                setTiers(sorted);
            } catch (fallbackErr) {
                console.error("Failed to load tiers (fallback):", fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (tier) => {
        setEditingTier(tier);
        setForm({
            name: tier.name || "",
            minPoints: String(tier.minPoints || 0),
            discountPercent: String(tier.discountPercent || 0),
            benefits: tier.benefits || "",
            sortOrder: String(tier.sortOrder || 0)
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingTier) return;
        try {
            setSaving(true);
            const updatedData = {
                ...editingTier,
                minPoints: parseInt(form.minPoints),
                discountPercent: parseFloat(form.discountPercent),
                benefits: form.benefits,
                sortOrder: parseInt(form.sortOrder)
            };
            await pointsAPI.updateTier(editingTier.id, updatedData);
            setModalOpen(false);
            loadTiers();
            showToast(t("common.update_success"));
        } catch (err) {
            showToast(t("common.update_error") + ": " + err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="tiers-page">
                <div className="tiers-loading">
                    <div className="tiers-spinner"></div>
                    <div className="tiers-loading-text">{t("common.loading_data")}...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tiers-page">
            {/* Page Header */}
            <div className="tiers-header">
                <div className="tiers-header-left">
                    <div className="tiers-header-icon">
                        <AwardIcon />
                    </div>
                    <div>
                        <h1 className="tiers-header-title">{t("tiers.title")}</h1>
                        <p className="tiers-header-subtitle">
                            {t("tiers.subtitle")}
                        </p>
                    </div>
                </div>
                <div className="tiers-header-badge">
                    💎 Premium Loyalty System
                </div>
            </div>

            {/* Tiers Grid */}
            <div className="tiers-grid">
                {tiers.map((tier) => {
                    const benefits = getTierBenefits(tier);
                    // Use real memberCount from API response (or 0 as fallback)
                    const memberCount = tier.memberCount || 0;

                    return (
                        <div key={tier.id} className={`tier-card ${getTierClass(tier.name)}`}>
                            {/* Card Header */}
                            <div className="tier-card-header">
                                <div className="tier-card-title">
                                    <div className="tier-card-icon">
                                        {getTierIcon(tier.name)}
                                    </div>
                                    <span className="tier-card-name">{tier.name}</span>
                                </div>
                                <div className="tier-member-count">
                                    <UsersIcon />
                                    <span>{memberCount.toLocaleString()} {t("tiers.label_members")}</span>
                                </div>
                            </div>

                            {/* Threshold Section */}
                            <div className="tier-threshold">
                                <div className="tier-threshold-label">{t("tiers.label_threshold")}</div>
                                <div>
                                    <span className="tier-threshold-value">
                                        {(tier.minPoints ?? 0).toLocaleString()}
                                    </span>
                                    <span className="tier-threshold-unit">{t("tiers.label_points_acc")}</span>
                                </div>
                            </div>

                            {/* Benefits List */}
                            <div className="tier-benefits">
                                {benefits.map((benefit, idx) => (
                                    <div
                                        key={idx}
                                        className={`tier-benefit-item ${benefit.primary ? 'primary' : ''}`}
                                    >
                                        <div className="tier-benefit-icon">
                                            <CheckIcon />
                                        </div>
                                        <span className="tier-benefit-text">{benefit.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Card Footer */}
                            <div className="tier-card-footer">
                                <button className="tier-edit-btn" onClick={() => openEdit(tier)}>
                                    <EditIcon />
                                    <span>{t("common.edit")}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rules Section */}
            <div className="tiers-rules-card">
                <div className="tiers-rules-header">
                    <RuleIcon />
                    <span className="tiers-rules-title">{t("tiers.label_rules")}</span>
                </div>
                <div className="tiers-rules-list">
                    <div className="tiers-rule-item">
                        <span className="tiers-rule-bullet">✦</span>
                        <span><strong>{t("tiers.rule_acc_rate_title")}:</strong> {t("tiers.rule_acc_rate_desc")}</span>
                    </div>
                    <div className="tiers-rule-item">
                        <span className="tiers-rule-bullet">✦</span>
                        <span><strong>{t("tiers.rule_exchange_rate_title")}:</strong> {t("tiers.rule_exchange_rate_desc")}</span>
                    </div>
                    <div className="tiers-rule-item">
                        <span className="tiers-rule-bullet">✦</span>
                        <span><strong>{t("tiers.rule_expiry_title")}:</strong> {t("tiers.rule_expiry_desc")}</span>
                    </div>
                    <div className="tiers-rule-item">
                        <span className="tiers-rule-bullet">✦</span>
                        <span><strong>{t("tiers.rule_upgrade_title")}:</strong> {t("tiers.rule_upgrade_desc")}</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                open={modalOpen}
                title={`${t("common.edit")} ${t("tiers.title").toLowerCase().replace("hạng thành viên", "hạng")}: ${editingTier?.name}`}
                onClose={() => setModalOpen(false)}
            >
                <div className="formGrid">
                    <label className="field">
                        <span>{t("tiers.label_tier_name")}</span>
                        <input
                            value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            disabled
                        />
                    </label>
                    <label className="field">
                        <span>{t("common.order")}</span>
                        <input
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                        />
                    </label>
                    <label className="field">
                        <span>{t("tiers.label_points_req")}</span>
                        <input
                            type="number"
                            value={form.minPoints}
                            onChange={(e) => setForm(f => ({ ...f, minPoints: e.target.value }))}
                        />
                    </label>
                    <label className="field">
                        <span>{t("promotions.type_percentage")} (%)</span>
                        <input
                            type="number"
                            step="0.1"
                            value={form.discountPercent}
                            onChange={(e) => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                        />
                    </label>
                    <label className="field full" style={{ gridColumn: 'span 2' }}>
                        <span>{t("tiers.label_benefits_custom")}</span>
                        <textarea
                            value={form.benefits}
                            onChange={(e) => setForm(f => ({ ...f, benefits: e.target.value }))}
                            placeholder={t("tiers.placeholder_benefits")}
                            style={{ padding: 12, borderRadius: 8, border: "1px solid var(--admin-border)", minHeight: 100, background: "var(--glass-bg)", color: "var(--admin-text)" }}
                        />
                    </label>
                </div>
                <div className="modalActions">
                    <button className="admin-btn admin-btn-outline" type="button" onClick={() => setModalOpen(false)} disabled={saving}>
                        {t("common.cancel").toUpperCase()}
                    </button>
                    <button className="admin-btn admin-btn-primary" type="button" onClick={handleSave} disabled={saving}>
                        {saving ? t("common.saving").toUpperCase() : t("common.save_changes").toUpperCase()}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
