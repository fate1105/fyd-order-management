import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@shared/context/ToastContext";
import "../styles/dashboard.css";
import "../styles/ai-insights.css";
import api from "@shared/utils/api.js";
import { useTranslation } from "react-i18next";
import SalesForecast from "../components/SalesForecast.jsx";

// Icons specifically for the AI dashboard
const Icons = {
  summary: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  anomaly: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  brain: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54z" /></svg>,
  inventory: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  trend: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  gift: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>,
  promo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
};

export default function AI() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [tab, setTab] = useState("inventory_warning");
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftSkus, setDraftSkus] = useState([]);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    loadAiData();
  }, []);

  async function loadAiData() {
    setLoading(true);
    try {
      const [insightsRes, summaryRes, anomaliesRes] = await Promise.all([
        api.dashboard.getAiSuggestions(),
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/ai/admin-summary`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/ai/anomalies`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);

      setInsights(insightsRes || []);
      setSummary(summaryRes);
      setAnomalies(anomaliesRes || []);
    } catch (error) {
      console.error("AI Load Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInsights = insights.filter(i => i.category === tab);
  const getCount = (cat) => insights.filter(i => i.category === cat).length;

  const handleAction = async (insight, action) => {
    if (action.type === "apply_sku") {
      const newSkus = [...new Set([...draftSkus, ...(insight.skus || [])])];
      setDraftSkus(newSkus);
      showToast(t("ai.msg_sku_added", "Đã thêm SKU vào danh sách nháp"), "success");
    } else if (action.type === "create_reminder") {
      setApplying(insight.id);
      try {
        const result = await api.dashboard.applyAiAction(insight.id, insight.category, insight.data || {});
        if (result.success) {
          showToast(t("ai.msg_reminder_created", "Đã tạo lời nhắc nhập hàng"), "success");
        }
      } catch (err) {
        showToast(t("ai.msg_action_error", "Lỗi khi thực hiện yêu cầu"), "error");
      } finally {
        setApplying(null);
      }
    } else {
      navigate("/admin/" + (action.type === 'create_promotion' ? 'promotions' : 'featured'));
    }
  };

  const TABS = [
    { key: "inventory_warning", label: t("ai.tab_inventory"), icon: <Icons.inventory />, desc: t("ai.tab_inventory_desc") },
    { key: "sales_trend", label: t("ai.tab_trend"), icon: <Icons.trend />, desc: t("ai.tab_trend_desc") },
    { key: "combo_suggestion", label: t("ai.tab_combo"), icon: <Icons.gift />, desc: t("ai.tab_combo_desc") },
    { key: "promotion_smart", label: t("ai.tab_promo"), icon: <Icons.promo />, desc: t("ai.tab_promo_desc") },
  ];

  if (loading) {
    return (
      <div className="ai-loading">
        <div className="ai-loading-spinner"></div>
        <h2>{t("ai.typing", "Kết nối trung tâm dữ liệu AI...")}</h2>
        <p>{t("common.loading", "ĐANG TẢI...")}</p>
      </div>
    );
  }

  return (
    <div className="ai-insights-page">
      {/* Cyber Header */}
      <div className="ai-insights-header">
        <div>
          <h1 className="ai-insights-title">
            <Icons.brain />
            {t("ai.smart_hub_title", "FYD Smart Hub")}
          </h1>
          <p className="ai-insights-subtitle">
            {t("ai.smart_hub_subtitle")}
          </p>
        </div>
        <div className="ai-insights-badge">
          <span className="pulse-dot"></span>
          {t("ai.ai_engine_active", "AI ENGINE ACTIVE")}
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="ai-summary-section">
        <div className="ai-summary-card">
          <div className="summary-header">
            <Icons.summary />
            {t("ai.strategic_summary", "TÓM TẮT CHIẾN LƯỢC AI")}
          </div>
          <div className="summary-content">
            {summary?.summaryText || t("ai.analyzing_growth", "Đang phân tích các chỉ số tăng trưởng...")}
          </div>
          <div className="summary-metrics">
            <div className="summary-metric-item">
              <span className="metric-label">{t("ai.today_revenue", "Doanh thu hôm nay")}</span>
              <span className="metric-value">
                {new Intl.NumberFormat(t("common.locale_tag"), { style: 'currency', currency: 'VND' }).format(summary?.todayRevenue || 0)}
              </span>
            </div>
            <div className="summary-metric-item">
              <span className="metric-label">{t("ai.daily_variation", "Biến động ngày")}</span>
              <span className={`metric-value ${summary?.revenueChange?.startsWith('+') ? 'positive' : ''}`}>
                {summary?.revenueChange || 'N/A'}
              </span>
            </div>
            <div className="summary-metric-item">
              <span className="metric-label">{t("ai.pending_orders", "Đơn chờ xử lý")}</span>
              <span className="metric-value">{summary?.pendingOrders || 0}</span>
            </div>
          </div>
        </div>

        <div className="ai-anomalies-card">
          <div className="anomalies-header">
            <Icons.anomaly />
            {t("ai.anomaly_detection", "PHÁT HIỆN BẤT THƯỜNG")} ({anomalies.length})
          </div>
          <div className="anomaly-list">
            {anomalies.length > 0 ? anomalies.map((a, i) => (
              <div key={i} className={`anomaly-item severity-${a.severity?.toLowerCase()}`}>
                <div className="anomaly-title">{a.title}</div>
                <div className="anomaly-desc">{a.description}</div>
              </div>
            )) : (
              <div className="anomaly-empty">{t("ai.all_metrics_stable", "Mọi chỉ số đều đang ổn định.")}</div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Forecast */}
      <SalesForecast />

      {/* AI Recommendations */}
      <div className="ai-main-container">
        <aside className="ai-sidebar-tabs">
          {TABS.map(tData => (
            <button
              key={tData.key}
              className={`ai-tab-btn ${tab === tData.key ? 'active' : ''}`}
              onClick={() => setTab(tData.key)}
            >
              <span className="tab-label">
                {tData.icon}
                {tData.label}
                {getCount(tData.key) > 0 && <span className="tab-badge">{getCount(tData.key)}</span>}
              </span>
              <span className="tab-desc">{tData.desc}</span>
            </button>
          ))}
        </aside>

        <main className="ai-insights-grid">
          {filteredInsights.length > 0 ? filteredInsights.map(insight => (
            <div key={insight.id} className="ai-insight-card">
              <div className="insight-header">
                <span className={`insight-type-badge insight-type-${insight.type}`}>
                  {t(`ai.type_${insight.type}`, insight.type.toUpperCase())}
                </span>
                <div className="confidence-label">
                  {Math.round(insight.confidence * 100)}% {t("ai.confidence_level", "Tin cậy")}
                </div>
              </div>

              <h3 className="insight-title">{insight.title}</h3>
              <p className="insight-description">{insight.description}</p>

              <div className="confidence-module">
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }}></div>
                </div>
              </div>

              <div className="insight-actions">
                {insight.actions?.map((btn, idx) => (
                  <button
                    key={idx}
                    className={`insight-btn ${btn.type === 'apply_sku' ? 'insight-btn-secondary' : 'insight-btn-primary'}`}
                    onClick={() => handleAction(insight, btn)}
                    disabled={applying === insight.id}
                  >
                    {applying === insight.id ? <span className="spinner"></span> : btn.label}
                  </button>
                ))}
              </div>
            </div>
          )) : (
            <div className="ai-empty-state">
              <p>{t("ai.empty_suggestion", "Đang tìm kiếm các đề xuất mới...")}</p>
            </div>
          )}
        </main>
      </div>

      {/* SKU Selection Panel */}
      {draftSkus.length > 0 && (
        <div className="sku-draft-panel">
          <div className="draft-info">
            <h4>{t("ai.sku_draft_title")} ({draftSkus.length})</h4>
            <p>{t("ai.sku_draft_subtitle")}</p>
          </div>
          <div className="draft-tags">
            {draftSkus.map(s => (
              <span key={s} className="draft-tag">
                {s}
                <button onClick={() => setDraftSkus(prev => prev.filter(x => x !== s))}>×</button>
              </span>
            ))}
          </div>
          <button className="insight-btn" style={{ background: '#38bdf8', color: '#000', width: 'auto', padding: '12px 24px' }}>
            {t("ai.create_campaign", "Tạo chiến dịch")}
          </button>
        </div>
      )}
    </div>
  );
}
