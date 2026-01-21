import { useState, useEffect } from "react";
import { aiAPI } from "@shared/utils/api.js";
import "./anomaly-alerts.css";

const SEVERITY_CONFIG = {
    HIGH: { icon: "🚨", label: "Nghiêm trọng", class: "high" },
    MEDIUM: { icon: "⚠️", label: "Cần chú ý", class: "medium" },
    LOW: { icon: "ℹ️", label: "Thông tin", class: "low" }
};

const TYPE_CONFIG = {
    REVENUE: { icon: "💰", label: "Doanh thu" },
    ORDER: { icon: "📦", label: "Đơn hàng" },
    INVENTORY: { icon: "📊", label: "Tồn kho" }
};

export default function AnomalyAlerts({ compact = false }) {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAnomalies = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await aiAPI.getAnomalies();
            setAnomalies(data || []);
        } catch (err) {
            console.error("Failed to load anomalies:", err);
            setError("Không thể tải cảnh báo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnomalies();
    }, []);

    if (loading) {
        return (
            <div className={`anomaly-alerts ${compact ? 'compact' : ''}`}>
                <div className="anomaly-loading">
                    <div className="spinner"></div>
                    <span>Đang phân tích...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`anomaly-alerts ${compact ? 'compact' : ''}`}>
                <div className="anomaly-error">
                    <span>⚠️ {error}</span>
                    <button onClick={loadAnomalies} className="retry-btn">Thử lại</button>
                </div>
            </div>
        );
    }

    if (anomalies.length === 0) {
        return (
            <div className={`anomaly-alerts ${compact ? 'compact' : ''}`}>
                <div className="anomaly-header">
                    <div className="anomaly-header-left">
                        <span className="anomaly-icon">🛡️</span>
                        <h3>Cảnh báo hệ thống</h3>
                    </div>
                    <button onClick={loadAnomalies} className="refresh-btn" title="Làm mới">
                        🔄
                    </button>
                </div>
                <div className="anomaly-empty">
                    <span className="check-icon">✅</span>
                    <p>Không phát hiện bất thường</p>
                    <span className="sub-text">Hệ thống đang hoạt động ổn định</span>
                </div>
            </div>
        );
    }

    // Sort by severity (HIGH first)
    const sortedAnomalies = [...anomalies].sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (order[a.severity] || 2) - (order[b.severity] || 2);
    });

    return (
        <div className={`anomaly-alerts ${compact ? 'compact' : ''}`}>
            <div className="anomaly-header">
                <div className="anomaly-header-left">
                    <span className="anomaly-icon">🛡️</span>
                    <div>
                        <h3>Cảnh báo hệ thống</h3>
                        <span className="anomaly-count">{anomalies.length} vấn đề phát hiện</span>
                    </div>
                </div>
                <button onClick={loadAnomalies} className="refresh-btn" title="Làm mới">
                    🔄
                </button>
            </div>

            <div className="anomaly-list">
                {sortedAnomalies.slice(0, compact ? 3 : 10).map((anomaly, idx) => {
                    const severityConfig = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.LOW;
                    const typeConfig = TYPE_CONFIG[anomaly.type] || { icon: "📋", label: "Khác" };

                    return (
                        <div key={idx} className={`anomaly-item ${severityConfig.class}`}>
                            <div className="anomaly-item-header">
                                <span className="type-badge">
                                    {typeConfig.icon} {typeConfig.label}
                                </span>
                                <span className={`severity-badge ${severityConfig.class}`}>
                                    {severityConfig.icon} {severityConfig.label}
                                </span>
                            </div>
                            <h4 className="anomaly-title">{anomaly.title}</h4>
                            <p className="anomaly-desc">{anomaly.description}</p>
                            {anomaly.relatedValue && (
                                <div className="anomaly-value">
                                    <span>Giá trị:</span> <strong>{anomaly.relatedValue}</strong>
                                </div>
                            )}
                            {anomaly.suggestion && (
                                <div className="anomaly-suggestion">
                                    💡 {anomaly.suggestion}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {anomalies.length > (compact ? 3 : 10) && (
                <div className="anomaly-footer">
                    <span>+{anomalies.length - (compact ? 3 : 10)} cảnh báo khác</span>
                </div>
            )}
        </div>
    );
}
