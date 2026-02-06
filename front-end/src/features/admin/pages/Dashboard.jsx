import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import api, { formatVND } from "@shared/utils/api.js";
import { aiAPI } from "@shared/utils/api.js";
import { useWebSocket } from "@shared/hooks/useWebSocket";
import { useToast } from "@shared/context/ToastContext";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

// SVG Icons
const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18M3 12h18M5.5 5.5l13 13M5.5 18.5l13-13" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const NovaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const KPI = ({ title, value, trend, trendType }) => {
  const { t } = useTranslation();
  return (
    <div className="card kpi">
      <div className="kpiTop">
        <div className="kpiTitle">{title}</div>
        <div className={`kpiTrend ${trendType || ""}`}>
          {trendType === "up" && <TrendUpIcon />}
          {trendType === "down" && <TrendDownIcon />}
          {(trendType === "warn" || trendType === "info") ? t(`dashboard.${trend}`, trend) : trend}
        </div>
      </div>
      <div className="kpiValue">{value}</div>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const { t } = useTranslation();
  const getStatusClass = (s) => {
    switch (s) {
      case "DELIVERED":
      case "COMPLETED":
        return "success";
      case "SHIPPING":
        return "info";
      case "PENDING":
        return "warning";
      case "CANCELLED":
      case "RETURNED":
        return "error";
      default:
        return "";
    }
  };

  const getStatusLabel = (s) => {
    const labels = {
      PENDING: t("status.pending"),
      CONFIRMED: t("status.confirmed"),
      PROCESSING: t("status.processing"),
      SHIPPING: t("status.shipping"),
      DELIVERED: t("status.delivered"),
      COMPLETED: t("status.completed"),
      CANCELLED: t("status.cancelled"),
      RETURNED: t("status.returned"),
    };
    return labels[s] || s;
  };

  return <span className={`status-pill ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>;
};

function MiniAvatar({ name }) {
  const ch = (name || "?").trim().slice(0, 1).toUpperCase();
  return <div className="miniAvatar">{ch}</div>;
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
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
    </div>
  );
}

// AI Panel Component - Combined Summary, Chat and Alerts
function AiPanel() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("assistant");
  const [summary, setSummary] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Function to render message with product cards
  const renderMessageContent = (content) => {
    if (!content || typeof content !== 'string') return content;

    const productRegex = /PRODUCT\[(\d+)\|([^|]+)\|(\d+)\|([^\]]*)\](?:\s*\(SKU:\s*([^,]+),\s*còn\s*(\d+)\))?/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = productRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
      }

      const productId = match[1];
      const productName = match[2];
      const productPrice = match[3];
      const productImage = match[4] || null;
      const sku = match[5] || null;
      const stock = match[6] || null;

      parts.push(
        <div
          key={`product-${productId}-${match.index}`}
          onClick={() => navigate(`/admin/products`)}
          className="admin-ai-product-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            margin: '8px 0',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '10px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.1)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {productName}
            </div>
            <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: '600' }}>
              {formatVND(productPrice)}
            </div>
          </div>
          <TrendUpIcon />
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : content;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, anomalyData] = await Promise.all([
        aiAPI.getAdminSummary().catch(() => null),
        aiAPI.getAnomalies().catch(() => [])
      ]);
      setSummary(summaryData);
      setAnomalies(anomalyData || []);
    } catch (err) {
      console.error("Failed to load AI data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || chatLoading) return;
    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatLoading(true);
    try {
      const response = await aiAPI.adminChat(userMessage);
      if (response.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: response.error || t("common.error_occurred") }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: t("common.connection_error") }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SEVERITY_CONFIG = {
    HIGH: { label: t("ai.severity_high"), class: "high" },
    MEDIUM: { label: t("ai.severity_medium"), class: "medium" },
    LOW: { label: t("ai.severity_low"), class: "low" }
  };

  if (loading) {
    return (
      <div className="ai-panel-card">
        <div className="ai-panel-loading">
          <div className="spinner"></div>
          <span>{t("ai.typing")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-panel-card">
      <div className="ai-panel-tabs">
        <button
          className={`ai-panel-tab ${activeTab === "assistant" ? "active" : ""}`}
          onClick={() => setActiveTab("assistant")}
          type="button"
        >
          <SparkleIcon />
          <span>{t("ai.panel_title")}</span>
        </button>
        <button
          className={`ai-panel-tab ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("alerts")}
          type="button"
        >
          <AlertIcon />
          <span>{t("ai.alerts_tab")}</span>
          {anomalies.length > 0 && <span className="tab-badge">{anomalies.length}</span>}
        </button>
      </div>

      <div className="ai-panel-content">
        {activeTab === "assistant" ? (
          <>
            {summary && (
              <div className="dash-ai-summary">
                <div className="dash-ai-summary-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="ai-status-pulse"></div>
                    <span className="ai-label">{t("ai.analysis_today")}</span>
                  </div>
                  <span className="ai-badge live">{t("ai.live_analytics", "LIVE ANALYTICS")}</span>
                </div>
                <p className="dash-ai-summary-text">{summary.summaryText}</p>

                {summary.inventoryAlerts && summary.inventoryAlerts.length > 0 && (
                  <div className="dash-ai-inventory-alerts">
                    {summary.inventoryAlerts.slice(0, 2).map((alert, idx) => (
                      <div key={idx} className="dash-ai-inventory-item">
                        <AlertIcon />
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="ai-chat-section">
              <div className="ai-messages">
                {messages.length === 0 && (
                  <div className="ai-placeholder-chat">
                    <NovaIcon />
                    <p>{t("ai.placeholder_chat")}</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div key={idx} className={`ai-message ${msg.role}`}>
                    {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                  </div>
                ))}

                {chatLoading && (
                  <div className="ai-typing">
                    <span></span><span></span><span></span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="ai-system-alerts">
            <div className="ai-alerts-header">
              <span className="ai-label">{t("ai.system_alerts")}</span>
              <button className="refresh-btn" onClick={loadData} type="button">
                <RefreshIcon />
              </button>
            </div>

            {anomalies.length === 0 ? (
              <div className="ai-alerts-empty">
                <div className="check-circle"><CheckIcon /></div>
                <p>{t("ai.no_alerts")}</p>
                <span>{t("ai.system_stable")}</span>
              </div>
            ) : (
              <div className="ai-alerts-list">
                {anomalies.map((anomaly, idx) => {
                  const config = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.LOW;
                  return (
                    <div key={idx} className={`ai-alert-item ${config.class}`}>
                      <div className="ai-alert-header">
                        <span className={`severity-badge ${config.class}`}>{config.label}</span>
                      </div>
                      <h4 className="ai-alert-title">{anomaly.title}</h4>
                      <p className="ai-alert-desc">{anomaly.description}</p>
                      {anomaly.suggestion && (
                        <div className="ai-alert-suggestion">
                          <strong>{t("ai.suggestion")}:</strong> {anomaly.suggestion}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === "assistant" && (
        <div className="ai-input-wrapper">
          <div className="ai-input-container">
            <input
              type="text"
              className="ai-input"
              placeholder={t("ai.input_placeholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={chatLoading}
            />
            <button
              className="ai-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || chatLoading}
              type="button"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const dashboardData = await api.dashboard.get();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // WebSocket for real-time notifications
  const onNotificationReceived = useCallback((notification) => {
    if (notification.type === 'order') {
      showToast(notification.message || t("dashboard.new_order_toast", "Có đơn hàng mới!"), "info");
      // Refresh data silently to update KPIs and recent orders
      loadDashboard(true);
    }
  }, [showToast, loadDashboard]);

  useWebSocket('/topic/notifications', onNotificationReceived);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>{t("common.loading")}</div>;

  const kpis = data?.kpis || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="dash compact">
      {/* Compact Header */}
      <section className="compact-header">
        <div className="compact-header-left">
          <h1 className="compact-title">{t("dashboard.title", "FYD OPERATING SYSTEM")}</h1>
          <div className="compact-badges">
            <span className="compact-badge">{t("dashboard.realtime", "REAL-TIME")}</span>
            <span className="compact-badge">{t("dashboard.gemini_ai", "GEMINI AI")}</span>
          </div>
        </div>
        <div className="compact-header-actions">
          <button className="admin-btn admin-btn-outline" type="button" onClick={() => nav("/admin/ai")}>
            {t("dashboard.view_ai", "XEM AI")}
          </button>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="kpiGrid">
        {kpis.map((k, i) => (
          <KPI
            key={i}
            title={t(`dashboard.kpi_${k.id}`, k.title)}
            value={k.value}
            trend={k.trendLabel}
            trendType={k.trendType}
          />
        ))}
      </section>

      {/* Main Content Grid - Orders + AI Panel */}
      <section className="dashboard-main-grid">
        {/* Recent Orders - Takes more space */}
        <div className="card tableCard">
          <div className="cardHead">
            <div>
              <div className="cardTitle">{t("dashboard.recent_orders", "Đơn hàng gần đây")}</div>
              <div className="cardSub">{t("dashboard.live_data", "Dữ liệu thời gian thực")}</div>
            </div>
            <button className="admin-btn admin-btn-outline" type="button" onClick={() => nav("/admin/orders")} style={{ padding: '6px 12px', fontSize: '11px' }}>
              {t("dashboard.view_all")}
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("dashboard.customer")}</th>
                  <th>{t("dashboard.order_code")}</th>
                  <th>{t("dashboard.total_amount")}</th>
                  <th>{t("dashboard.status")}</th>
                  <th>{t("dashboard.time")}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="cellFlex">
                        <MiniAvatar name={o.customer?.fullName || o.shippingName} />
                        <div className="nameStack">
                          <div className="nameMain">{o.customer?.fullName || o.shippingName || t("dashboard.guest")}</div>
                          <div className="nameSub">{o.customer?.phone || o.shippingPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>#{o.orderNumber || o.id}</td>
                    <td style={{ fontWeight: '800' }}>{formatVND(o.totalAmount)}</td>
                    <td><StatusPill status={o.status} /></td>
                    <td style={{ color: '#666', fontSize: '12px' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString(t("common.locale_tag"), { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{t("common.no_data")}</div>}
          </div>
        </div>

        {/* AI Panel - Unified sidebar with tabs */}
        <div className="ai-panel-sidebar">
          <AiPanel />
        </div>
      </section>

    </div>
  );
}
