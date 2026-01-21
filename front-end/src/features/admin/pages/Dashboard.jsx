import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import api, { formatVND } from "@shared/utils/api.js";
import { aiAPI } from "@shared/utils/api.js";

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

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const KPI = ({ title, value, trend, trendType }) => (
  <div className="card kpi">
    <div className="kpiTop">
      <div className="kpiTitle">{title}</div>
      <div className={`kpiTrend ${trendType || ""}`}>
        {trendType === "up" && <TrendUpIcon />}
        {trendType === "down" && <TrendDownIcon />}
        {trend}
      </div>
    </div>
    <div className="kpiValue">{value}</div>
  </div>
);

const StatusPill = ({ status }) => {
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
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPING: "Đang giao",
      DELIVERED: "Hoàn tất",
      COMPLETED: "Hoàn tất",
      CANCELLED: "Đã hủy",
      RETURNED: "Hoàn trả",
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

    // Regex to match product tags: PRODUCT[ID|Name|Price|ImageURL] (SKU: xxx, còn y)
    // Also captures optional trailing SKU/stock info
    const productRegex = /PRODUCT\[(\d+)\|([^|]+)\|(\d+)\|([^\]]*)\](?:\s*\(SKU:\s*([^,]+),\s*còn\s*(\d+)\))?/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = productRegex.exec(content)) !== null) {
      // Add text before the product card
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Extract product info
      const productId = match[1];
      const productName = match[2];
      const productPrice = match[3];
      const productImage = match[4] || null;
      const sku = match[5] || null;  // Captured SKU
      const stock = match[6] || null;  // Captured stock

      // Add product card - Admin Premium Dark Theme
      parts.push(
        <div
          key={`product-${productId}-${match.index}`}
          onClick={() => navigate(`/admin/products`)}
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
            transition: 'all 0.2s ease',
            width: '100%',
            boxSizing: 'border-box',
            clear: 'both' // Force new line
          }}
          className="admin-ai-product-card"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Product Image */}
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'cover',
                borderRadius: '8px',
                flexShrink: 0,
                background: 'rgba(255,255,255,0.1)'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          {/* Product Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: '700',
              fontSize: '13px',
              color: '#fff',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {productName}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#4ade80',
              fontWeight: '600',
              marginBottom: stock ? '2px' : '0'
            }}>
              {new Intl.NumberFormat('vi-VN').format(productPrice)}₫
            </div>
            {stock && (
              <div style={{
                fontSize: '10px',
                color: parseInt(stock) <= 2 ? '#f87171' : parseInt(stock) <= 5 ? '#fbbf24' : '#94a3b8',
                fontWeight: '500'
              }}>
                Còn {stock} sp
              </div>
            )}
          </div>

          {/* Arrow Icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex)}
        </span>
      );
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
        setMessages((prev) => [...prev, { role: "assistant", content: response.error || "Có lỗi xảy ra." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Không thể kết nối. Vui lòng thử lại." }]);
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
    HIGH: { label: "Nghiêm trọng", class: "high" },
    MEDIUM: { label: "Cần chú ý", class: "medium" },
    LOW: { label: "Thông tin", class: "low" }
  };

  if (loading) {
    return (
      <div className="ai-panel-card">
        <div className="ai-panel-loading">
          <div className="spinner"></div>
          <span>Đang phân tích dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-panel-card">
      {/* Tab Header */}
      <div className="ai-panel-tabs">
        <button
          className={`ai-panel-tab ${activeTab === "assistant" ? "active" : ""}`}
          onClick={() => setActiveTab("assistant")}
          type="button"
        >
          <SparkleIcon />
          <span>AI Assistant</span>
        </button>
        <button
          className={`ai-panel-tab ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("alerts")}
          type="button"
        >
          <AlertIcon />
          <span>Cảnh báo</span>
          {anomalies.length > 0 && <span className="tab-badge">{anomalies.length}</span>}
        </button>
      </div>

      {/* Assistant Tab */}
      {activeTab === "assistant" && (
        <div className="ai-panel-content">
          {/* Summary Section */}
          {summary && (
            <div className="ai-summary-section">
              <div className="ai-summary-header">
                <span className="ai-label">PHÂN TÍCH HÔM NAY</span>
                <span className="ai-badge live">LIVE</span>
              </div>
              <p className="ai-summary-text">{summary.summaryText}</p>

              {/* Inventory Alerts in Summary */}
              {summary.inventoryAlerts && summary.inventoryAlerts.length > 0 && (
                <div className="ai-inventory-alerts">
                  {summary.inventoryAlerts.slice(0, 2).map((alert, idx) => (
                    <div key={idx} className="ai-inventory-item">
                      <AlertIcon />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          <div className="ai-chat-section">
            <div className="ai-chat-header">
              <span className="ai-label">HỎI AI VỀ DOANH NGHIỆP</span>
            </div>

            <div className="ai-messages">
              {messages.length === 0 && (
                <div className="ai-message assistant">
                  Tôi có thể giúp gì về doanh thu, tồn kho, hoặc gợi ý kinh doanh?
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`ai-message ${msg.role}`}>
                  {msg.role === "assistant"
                    ? renderMessageContent(msg.content)
                    : msg.content}
                </div>
              ))}

              {chatLoading && (
                <div className="ai-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>

            <div className="ai-input-container">
              <input
                type="text"
                className="ai-input"
                placeholder="Nhập câu hỏi..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
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
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="ai-panel-content">
          <div className="ai-alerts-header">
            <span className="ai-label">CẢNH BÁO HỆ THỐNG</span>
            <button className="refresh-btn" onClick={loadData} type="button" title="Làm mới">
              <RefreshIcon />
            </button>
          </div>

          {anomalies.length === 0 ? (
            <div className="ai-alerts-empty">
              <div className="check-circle">
                <CheckIcon />
              </div>
              <p>Không phát hiện bất thường</p>
              <span>Hệ thống hoạt động ổn định</span>
            </div>
          ) : (
            <div className="ai-alerts-list">
              {anomalies.slice(0, 5).map((anomaly, idx) => {
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
                        <span>Gợi ý:</span> {anomaly.suggestion}
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
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardData = await api.dashboard.get();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>ĐANG TẢI...</div>;

  const kpis = data?.kpis || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="dash compact">
      {/* Compact Header */}
      <section className="compact-header">
        <div className="compact-header-left">
          <h1 className="compact-title">FYD OPERATING SYSTEM</h1>
          <div className="compact-badges">
            <span className="compact-badge">REAL-TIME</span>
            <span className="compact-badge">GEMINI AI</span>
          </div>
        </div>
        <div className="compact-header-actions">
          <button className="admin-btn admin-btn-primary" type="button" onClick={() => setOpenCreate(true)}>
            + TẠO ĐƠN
          </button>
          <button className="admin-btn admin-btn-outline" type="button" onClick={() => nav("/admin/ai")}>
            XEM AI
          </button>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="kpiGrid">
        {kpis.map((k, i) => (
          <KPI
            key={i}
            title={k.title}
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
              <div className="cardTitle">Đơn hàng gần đây</div>
              <div className="cardSub">Dữ liệu thời gian thực</div>
            </div>
            <button className="admin-btn admin-btn-outline" type="button" onClick={() => nav("/admin/orders")} style={{ padding: '6px 12px', fontSize: '11px' }}>
              XEM TẤT CẢ
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>KHÁCH HÀNG</th>
                  <th>MÃ ĐƠN</th>
                  <th>TỔNG TIỀN</th>
                  <th>TRẠNG THÁI</th>
                  <th>THỜI GIAN</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="cellFlex">
                        <MiniAvatar name={o.customer?.fullName || o.shippingName} />
                        <div className="nameStack">
                          <div className="nameMain">{o.customer?.fullName || o.shippingName || 'Khách'}</div>
                          <div className="nameSub">{o.customer?.phone || o.shippingPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>#{o.orderNumber || o.id}</td>
                    <td style={{ fontWeight: '800' }}>{formatVND(o.totalAmount)}</td>
                    <td><StatusPill status={o.status} /></td>
                    <td style={{ color: '#666', fontSize: '12px' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Không có đơn hàng nào.</div>}
          </div>
        </div>

        {/* AI Panel - Unified sidebar with tabs */}
        <div className="ai-panel-sidebar">
          <AiPanel />
        </div>
      </section>

      <Modal open={openCreate} title="TẠO ĐƠN HÀNG MỚI" onClose={() => setOpenCreate(false)}>
        <div className="formGrid">
          <label className="field">
            <span>Khách hàng</span>
            <input placeholder="Tên khách hàng" />
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input placeholder="09xx xxx xxx" />
          </label>
          <label className="field">
            <span>Sản phẩm</span>
            <input placeholder="Tìm sản phẩm..." />
          </label>
          <label className="field">
            <span>Số lượng</span>
            <input type="number" defaultValue="1" />
          </label>
        </div>

        <div className="modalActions">
          <button className="admin-btn admin-btn-outline" type="button" onClick={() => setOpenCreate(false)}>
            HỦY BỎ
          </button>
          <button
            className="admin-btn admin-btn-primary"
            type="button"
            onClick={() => {
              setOpenCreate(false);
              nav("/admin/orders");
            }}
          >
            LƯU ĐƠN HÀNG
          </button>
        </div>
      </Modal>
    </div>
  );
}
