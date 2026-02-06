import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./SalesForecast.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// SVG Icons to replace emojis
const Icons = {
    trendUp: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    ),
    trendDown: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    ),
    stable: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
        </svg>
    ),
    ai: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
    ),
    info: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    )
};

/**
 * SalesForecast component - displays AI-powered sales predictions.
 * Uses REAL data only. Removed simulation logic.
 */
export default function SalesForecast() {
    const { t } = useTranslation();
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [days, setDays] = useState(7);

    useEffect(() => {
        loadForecast();
    }, [days]);

    async function loadForecast() {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/forecast/sales?days=${days}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();
            if (data.success) {
                setForecast(data);
                setError(null);
            } else {
                // Handle "No data" message from backend
                setError(data.message || t("ai.no_data_for_forecast", "Chưa đủ dữ liệu để thực hiện dự báo"));
                setForecast(null);
            }
        } catch (err) {
            console.error("Forecast error:", err);
            setError(t("common.error_occurred", "Có lỗi xảy ra khi tải dữ liệu"));
            setForecast(null);
        } finally {
            setLoading(false);
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
        });
    }

    const getMaxValue = () => {
        if (!forecast) return 0;
        const histMax = Math.max(...(forecast.historicalData || []).map(d => parseFloat(d.sales) || 0), 1000000);
        const forecastMax = Math.max(...(forecast.forecasts || []).map(d => d.predictedSales || 0), 1000000);
        return Math.max(histMax, forecastMax) * 1.2;
    };

    if (loading) {
        return (
            <div className="sales-forecast-widget loading">
                <div className="forecast-header">
                    <div className="header-title">
                        <Icons.ai />
                        <h3>{t("ai.sales_forecast_title", "Dự báo Doanh số AI")}</h3>
                    </div>
                </div>
                <div className="forecast-loading">
                    <div className="forecast-skeleton"></div>
                </div>
            </div>
        );
    }

    if (error || !forecast) {
        return (
            <div className="sales-forecast-widget error">
                <div className="forecast-header">
                    <div className="header-title">
                        <Icons.ai />
                        <h3>{t("ai.sales_forecast_title", "Dự báo Doanh số AI")}</h3>
                    </div>
                </div>
                <div className="forecast-error">
                    <Icons.info />
                    <p>{error || t("common.no_data", "Không có dữ liệu")}</p>
                    <button onClick={loadForecast}>{t("common.retry", "Thử lại")}</button>
                </div>
            </div>
        );
    }

    const maxValue = getMaxValue();

    return (
        <div className="sales-forecast-widget">
            <div className="forecast-header">
                <div className="header-title">
                    <span className="ai-status-pulse"></span>
                    <h3>{t("ai.sales_forecast_title", "Dự báo Doanh số AI")}</h3>
                </div>
                <div className="forecast-controls">
                    <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
                        <option value={7}>7 {t("common.unit_days", "ngày")} {t("ai.future", "tới")}</option>
                        <option value={14}>14 {t("common.unit_days", "ngày")} {t("ai.future", "tới")}</option>
                        <option value={30}>30 {t("common.unit_days", "ngày")} {t("ai.future", "tới")}</option>
                    </select>
                </div>
            </div>

            {/* Metrics Row */}
            {forecast.metrics && (
                <div className="forecast-stats">
                    <div className="stat-card">
                        <span className="stat-label">{t("ai.average_daily", "TB hằng ngày")}</span>
                        <div className="stat-value">
                            {formatCurrency(forecast.metrics.averageDailySales)}
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">{t("ai.trend_direction", "Xu hướng")}</span>
                        <div className={`stat-value trend-indicator trend-${forecast.metrics.trendDirection.toLowerCase()}`}>
                            {forecast.metrics.trendDirection === "UP" ? <Icons.trendUp /> :
                                forecast.metrics.trendDirection === "DOWN" ? <Icons.trendDown /> : <Icons.stable />}
                            <span>
                                {forecast.metrics.trendDirection === "UP" ? t("ai.trend_up", "Tăng") :
                                    forecast.metrics.trendDirection === "DOWN" ? t("ai.trend_down", "Giảm") : t("ai.trend_stable", "Ổn định")}
                            </span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">{t("ai.growth_rate", "Tốc độ")}</span>
                        <div className="stat-value">
                            {forecast.metrics.trendStrength >= 0 ? '+' : ''}{Math.round(forecast.metrics.trendStrength * 100)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Chart Area */}
            <div className="forecast-visual">
                <div className="chart-wrapper">
                    <div className="y-axis-labels">
                        <span>{formatCurrency(maxValue)}</span>
                        <span>{formatCurrency(maxValue * 0.5)}</span>
                        <span>0</span>
                    </div>

                    <div className="bars-container">
                        {/* Historical Bars */}
                        {(forecast.historicalData || []).slice(-7).map((d, i) => (
                            <div key={`hist-${i}`} className="bar-group">
                                <div className="bar-outer">
                                    <div
                                        className="bar-fill historical"
                                        style={{ height: `${(parseFloat(d.sales) / maxValue) * 100}%` }}
                                    >
                                        <div className="bar-tooltip">
                                            {formatDate(d.date)}: {formatCurrency(d.sales)}
                                        </div>
                                    </div>
                                </div>
                                <span className="bar-date">{formatDate(d.date).split(',')[1]}</span>
                            </div>
                        ))}

                        <div className="forecast-divider"></div>

                        {/* Forecast Bars */}
                        {(forecast.forecasts || []).slice(0, 7).map((d, i) => (
                            <div key={`fc-${i}`} className="bar-group forecast">
                                <div className="bar-outer">
                                    <div
                                        className="bar-fill predicted"
                                        style={{ height: `${(d.predictedSales / maxValue) * 100}%` }}
                                    >
                                        <div className="confidence-glow"
                                            style={{
                                                bottom: `${(d.lowerBound / d.predictedSales) * 100}%`,
                                                top: `${(1 - d.upperBound / d.predictedSales) * 100}%`
                                            }}>
                                        </div>
                                        <div className="bar-tooltip">
                                            {formatDate(d.date)}<br />
                                            <strong>{formatCurrency(d.predictedSales)}</strong><br />
                                            <small>{t("ai.confidence", "Độ tin cậy")}: {Math.round(d.confidence * 100)}%</small>
                                        </div>
                                    </div>
                                </div>
                                <span className="bar-date">{formatDate(d.date).split(',')[1]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-legend-row">
                    <div className="legend-pill historical">
                        <span className="dot"></span> {t("ai.historical", "Lịch sử")}
                    </div>
                    <div className="legend-pill predicted">
                        <span className="dot"></span> {t("ai.ai_prediction", "Dự báo AI")}
                    </div>
                </div>
            </div>

            {/* Insights Panel */}
            {forecast.insights && forecast.insights.length > 0 && (
                <div className="insights-panel">
                    <div className="insights-header">
                        <Icons.info />
                        {t("ai.ai_insights_detail", "Thông tin chi tiết AI")}
                    </div>
                    <ul className="insights-list">
                        {forecast.insights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
