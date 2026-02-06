import { useState, useEffect, useCallback } from "react";
import { nightMarketAdminAPI } from "../../../shared/utils/api.js";
import Toast from "../../../shared/components/Toast";
import "../styles/night-market-admin.css";
import { useTranslation } from "react-i18next";

// SVG Icons
const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);

const SaveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

export default function NightMarketAdmin() {
    const { t } = useTranslation();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const showToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await nightMarketAdminAPI.getConfig();
            setConfig(data);
        } catch (error) {
            console.error("Failed to fetch Night Market config:", error);
            showToast(t("night_market.msg_load_error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await nightMarketAdminAPI.updateConfig(config);
            showToast(t("night_market.msg_update_success"));
        } catch (error) {
            showToast(t("night_market.msg_update_error") + ": " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="night-market-admin-page page-container">
            <div className="loading-state">{t("common.loading_data")}</div>
        </div>
    );

    return (
        <div className="night-market-admin-page page-container">
            <div className="nm-admin-content">
                <form onSubmit={handleSave} className="nm-admin-form">
                    <div className="nm-section-group">
                        <h4 className="nm-section-title">
                            <SettingsIcon />
                            {t("night_market.section_config")}
                        </h4>

                        <div className="nm-form-row">
                            <div className="nm-form-field">
                                <label>{t("night_market.label_min_offers")}</label>
                                <input
                                    type="number"
                                    value={config.minOffers}
                                    onChange={(e) => setConfig({ ...config, minOffers: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="nm-form-field">
                                <label>{t("night_market.label_max_offers")}</label>
                                <input
                                    type="number"
                                    value={config.maxOffers}
                                    onChange={(e) => setConfig({ ...config, maxOffers: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="nm-form-row">
                            <div className="nm-form-field">
                                <label>{t("night_market.label_min_discount")}</label>
                                <input
                                    type="number"
                                    value={config.minDiscountPercent}
                                    onChange={(e) => setConfig({ ...config, minDiscountPercent: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="nm-form-field">
                                <label>{t("night_market.label_max_discount")}</label>
                                <input
                                    type="number"
                                    value={config.maxDiscountPercent}
                                    onChange={(e) => setConfig({ ...config, maxDiscountPercent: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="nm-form-row">
                            <div className="nm-form-field">
                                <label>{t("night_market.label_duration")}</label>
                                <input
                                    type="number"
                                    value={config.offerDurationDays}
                                    onChange={(e) => setConfig({ ...config, offerDurationDays: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="nm-form-field">
                                <label>{t("night_market.label_status")}</label>
                                <div style={{
                                    marginTop: '8px',
                                    color: config.isActive ? 'var(--admin-success)' : 'var(--admin-danger)',
                                    fontWeight: 800,
                                    fontSize: '12px',
                                    letterSpacing: '1px'
                                }}>
                                    {config.isActive ? t("night_market.active") : t("night_market.inactive")}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="nm-actions">
                        <button type="submit" className="btn-primary-nm" disabled={saving}>
                            <SaveIcon />
                            <span>{saving ? t("common.saving") : t("common.save_settings")}</span>
                        </button>
                    </div>
                </form>
            </div>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
}
