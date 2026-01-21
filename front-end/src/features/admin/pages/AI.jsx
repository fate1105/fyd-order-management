import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import "../styles/ai-insights.css";
import api from "@shared/utils/api.js";

const TABS = [
  { key: "inventory_warning", label: "Tồn kho", icon: "inventory", desc: "Cảnh báo về hàng tồn kho" },
  { key: "sales_trend", label: "Xu hướng", icon: "trending", desc: "Phân tích xu hướng bán hàng" },
  { key: "combo_suggestion", label: "Mua kèm", icon: "gift", desc: "Gợi ý combo & cross-sell" },
  { key: "promotion_smart", label: "Khuyến mãi", icon: "tag", desc: "Đề xuất chiến lược giá" },
];

const TYPE_STYLES = {
  warning: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", label: "Cảnh báo" },
  alert: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", label: "Khẩn cấp" },
  success: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", label: "Tích cực" },
  info: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", label: "Gợi ý" },
};

const PRIORITY_STYLES = {
  HIGH: { color: "#ef4444", label: "Cao" },
  MEDIUM: { color: "#f59e0b", label: "Trung bình" },
  LOW: { color: "#22c55e", label: "Thấp" },
};

// Icon components
const Icons = {
  inventory: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  trending: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  gift: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  tag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  alert: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  robot: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  lightbulb: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
};

const getActionIcon = (type) => {
  switch (type) {
    case "apply_sku": return <Icons.tag />;
    case "create_reminder": return <Icons.alert />;
    case "create_promotion": return <Icons.tag />;
    case "push_featured": return <Icons.trending />;
    case "create_combo": return <Icons.gift />;
    default: return <Icons.tag />;
  }
};

// Modal Component
function AiActionModal({ result, onClose, onConfirm }) {
  // Editable reminder time
  const getInitialReminderTime = () => {
    if (result?.actionDetails?.reminderTime) {
      const d = new Date(result.actionDetails.reminderTime);
      return d.toISOString().slice(0, 16);
    }
    return '';
  };

  const [reminderTime, setReminderTime] = useState(getInitialReminderTime());

  if (!result) return null;

  const priorityStyle = result.actionDetails?.priority
    ? PRIORITY_STYLES[result.actionDetails.priority]
    : { color: "#94a3b8", label: "N/A" };

  const riskStyle = result.riskAssessment?.riskLevel
    ? PRIORITY_STYLES[result.riskAssessment.riskLevel]
    : { color: "#94a3b8", label: "N/A" };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(result, reminderTime);
    }
    onClose();
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-modal-success-icon">
            <Icons.check />
          </div>
          <h2>{result.title}</h2>
          <button className="ai-modal-close" onClick={onClose} type="button">
            <Icons.close />
          </button>
        </div>

        {/* Summary */}
        <div className="ai-modal-summary">
          {result.summary}
          {result.timestamp && (
            <div className="ai-modal-timestamp">
              Thời gian tạo nhắc hẹn: {new Date(result.timestamp).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>

        {/* Action Details */}
        {result.actionDetails && (
          <div className="ai-modal-section">
            <h3>Chi tiết hành động</h3>
            <div className="ai-modal-grid">
              <div className="ai-modal-stat">
                <span className="ai-modal-stat-label">Sản phẩm</span>
                <span className="ai-modal-stat-value">{result.actionDetails.productName}</span>
              </div>
              <div className="ai-modal-stat">
                <span className="ai-modal-stat-label">SKU</span>
                <span className="ai-modal-stat-value mono">{result.actionDetails.sku}</span>
              </div>
              <div className="ai-modal-stat">
                <span className="ai-modal-stat-label">Tồn kho hiện tại</span>
                <span className="ai-modal-stat-value">{result.actionDetails.currentStock} SP</span>
              </div>
              <div className="ai-modal-stat">
                <span className="ai-modal-stat-label">Tốc độ bán</span>
                <span className="ai-modal-stat-value">{result.actionDetails.dailySalesVelocity} SP/ngày</span>
              </div>
              <div className="ai-modal-stat highlight">
                <span className="ai-modal-stat-label">Số lượng đề xuất nhập</span>
                <span className="ai-modal-stat-value big">{result.actionDetails.recommendedQuantity} SP</span>
              </div>
              <div className="ai-modal-stat">
                <span className="ai-modal-stat-label">Tồn kho an toàn</span>
                <span className="ai-modal-stat-value">{result.actionDetails.safetyStock} SP</span>
              </div>
              <div className="ai-modal-stat">
                <span className="ai-modal-stat-label">Thời gian cần nhập</span>
                <span className="ai-modal-stat-value">{result.actionDetails.daysUntilRestock} ngày</span>
              </div>
              <div className="ai-modal-stat">
                <span className="ai-modal-stat-label">Mức độ ưu tiên</span>
                <span className="ai-modal-stat-value" style={{ color: priorityStyle.color }}>
                  {priorityStyle.label}
                </span>
              </div>
              <div className="ai-modal-stat reminder-time">
                <span className="ai-modal-stat-label">Thời gian nhắc hẹn</span>
                <input
                  type="datetime-local"
                  className="ai-modal-datetime-input"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {result.riskAssessment && (
          <div className="ai-modal-section risk">
            <h3>
              <Icons.alert />
              Đánh giá rủi ro
            </h3>
            <div className="ai-modal-risk-level" style={{ borderColor: riskStyle.color }}>
              <span style={{ color: riskStyle.color }}>Mức rủi ro: {riskStyle.label}</span>
            </div>
            <p className="ai-modal-risk-desc">{result.riskAssessment.riskDescription}</p>
            {result.riskAssessment.estimatedLostSales > 0 && (
              <p className="ai-modal-risk-lost">
                Dự kiến mất: <strong>{result.riskAssessment.estimatedLostSales} đơn hàng</strong> nếu không xử lý
              </p>
            )}
            <p className="ai-modal-risk-rec">
              <strong>Khuyến nghị:</strong> {result.riskAssessment.recommendation}
            </p>
          </div>
        )}

        {/* AI Reasoning */}
        {result.reasoning && (
          <div className="ai-modal-section reasoning">
            <h3>
              <Icons.lightbulb />
              Lý do AI đưa ra quyết định
            </h3>
            <pre className="ai-modal-reasoning">{result.reasoning}</pre>
          </div>
        )}

        {/* Footer */}
        <div className="ai-modal-footer">
          <button className="ai-modal-btn secondary" onClick={onClose} type="button">
            Hủy
          </button>
          <button className="ai-modal-btn primary" onClick={handleConfirm} type="button">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AI() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("inventory_warning");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftItems, setDraftItems] = useState([]);
  const [expandedReasons, setExpandedReasons] = useState({});
  const [actionResult, setActionResult] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    async function loadAI() {
      setLoading(true);
      try {
        const res = await api.dashboard.getAiSuggestions();
        setInsights(res || []);
      } catch (error) {
        console.error("Failed to load AI insights:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAI();
  }, []);

  const filteredList = insights.filter((x) => x.category === tab);
  const getCategoryCount = (category) => insights.filter((x) => x.category === category).length;

  const toggleReason = (id) => {
    setExpandedReasons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAction = async (insight, action) => {
    if (action.type === "apply_sku") {
      // Áp dụng SKU: chỉ thêm vào danh sách draft
      setDraftItems((prev) => {
        const merged = new Set([...prev, ...(insight.skus || [])]);
        return Array.from(merged);
      });
    } else if (action.type === "create_reminder") {
      // Tạo nhắc nhập hàng: gọi API tính toán + tạo notification
      setApplying(insight.id);
      try {
        const result = await api.dashboard.applyAiAction(
          insight.id,
          insight.category,
          insight.data || {}
        );
        setActionResult(result);

        // Tạo notification
        if (result.success && result.actionDetails) {
          try {
            await api.notification.create({
              title: "AI Gợi ý: Nhập hàng",
              message: result.summary,
              type: "AI_SUGGESTION",
              priority: result.actionDetails.priority || "MEDIUM",
            });
          } catch (notifError) {
            console.warn("Failed to create notification:", notifError);
          }
        }
      } catch (error) {
        console.error("Failed to apply AI action:", error);
        alert("Không thể thực hiện hành động. Vui lòng thử lại.");
      } finally {
        setApplying(null);
      }
    } else if (action.type === "create_promotion") {
      navigate("/admin/promotions");
    } else if (action.type === "push_featured") {
      navigate("/admin/featured");
    } else if (action.type === "create_combo") {
      setDraftItems((prev) => {
        const merged = new Set([...prev, ...(insight.skus || [])]);
        return Array.from(merged);
      });
    }
  };

  const removeSku = (sku) => {
    setDraftItems((prev) => prev.filter((s) => s !== sku));
  };

  const TabIcon = ({ iconName }) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <div className="ai-insights-page">
      {/* Modal */}
      {actionResult && (
        <AiActionModal
          result={actionResult}
          onClose={() => setActionResult(null)}
          onConfirm={async (result, reminderTime) => {
            // Tạo notification với thời gian nhắc hẹn đã chọn
            if (result.success && result.actionDetails) {
              try {
                await api.notification.create({
                  title: "AI Gợi ý: Nhập hàng",
                  message: `${result.summary} - Nhắc hẹn: ${new Date(reminderTime).toLocaleString('vi-VN')}`,
                  type: "AI_SUGGESTION",
                  priority: result.actionDetails.priority || "MEDIUM",
                });
              } catch (notifError) {
                console.warn("Failed to create notification:", notifError);
              }
            }
          }}
        />
      )}

      {/* Header */}
      <div className="ai-insights-header">
        <div>
          <h1 className="ai-insights-title">
            <span className="ai-icon-pulse"><Icons.robot /></span>
            AI Gợi ý thông minh
          </h1>
          <p className="ai-insights-subtitle">
            Phân tích dữ liệu realtime - Insight + Giải thích + Hành động cụ thể
          </p>
        </div>
        <div className="ai-insights-badge">
          <span className="pulse-dot"></span>
          LIVE
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="ai-tabs">
        {TABS.map((t) => {
          const count = getCategoryCount(t.key);
          return (
            <button
              key={t.key}
              className={`ai-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
              type="button"
            >
              <span className="ai-tab-icon"><TabIcon iconName={t.icon} /></span>
              <span className="ai-tab-label">{t.label}</span>
              {count > 0 && <span className="ai-tab-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      <div className="ai-tab-desc">
        <strong>{TABS.find((x) => x.key === tab)?.label}:</strong>{" "}
        {TABS.find((x) => x.key === tab)?.desc}
      </div>

      {/* Insights List */}
      {loading ? (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <p>Đang phân tích dữ liệu...</p>
        </div>
      ) : (
        <div className="ai-insights-list">
          {filteredList.map((insight) => {
            const style = TYPE_STYLES[insight.type] || TYPE_STYLES.info;
            const isExpanded = expandedReasons[insight.id];
            const isApplying = applying === insight.id;

            return (
              <div
                className="ai-insight-card"
                key={insight.id}
                style={{ borderColor: style.color }}
              >
                {/* Header */}
                <div className="ai-insight-header">
                  <span
                    className="ai-insight-type-badge"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                  <span className="ai-insight-title">{insight.title}</span>
                </div>

                {/* Description */}
                <p className="ai-insight-desc">{insight.description}</p>

                {/* Confidence Bar */}
                <div className="ai-confidence-row">
                  <div className="ai-confidence-bar">
                    <div
                      className="ai-confidence-fill"
                      style={{
                        width: `${Math.round(insight.confidence * 100)}%`,
                        background: `linear-gradient(90deg, ${style.color}, ${style.color}88)`,
                      }}
                    />
                  </div>
                  <span className="ai-confidence-value">
                    {Math.round(insight.confidence * 100)}% tin cậy
                  </span>
                </div>

                {/* Reasoning Accordion */}
                <button
                  className="ai-reasoning-toggle"
                  onClick={() => toggleReason(insight.id)}
                  type="button"
                >
                  <span>{isExpanded ? "▾" : "▸"}</span>
                  <span>Vì sao AI gợi ý này?</span>
                </button>
                {isExpanded && (
                  <div className="ai-reasoning-content">
                    <div className="ai-reasoning-icon"><Icons.lightbulb /></div>
                    <p>{insight.reasoning}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="ai-insight-actions">
                  {insight.actions &&
                    insight.actions.map((action, idx) => (
                      <button
                        key={idx}
                        className={`ai-action-btn ${action.type === "apply_sku" ? "secondary" : "primary"
                          } ${isApplying ? "loading" : ""}`}
                        onClick={() => handleAction(insight, action)}
                        disabled={isApplying}
                        type="button"
                      >
                        {isApplying ? (
                          <span className="ai-btn-spinner"></span>
                        ) : (
                          getActionIcon(action.type)
                        )}
                        <span>{action.label}</span>
                      </button>
                    ))}
                </div>

                {/* SKUs */}
                {insight.skus && insight.skus.length > 0 && (
                  <div className="ai-insight-skus">
                    <span className="ai-sku-label">SKUs:</span>
                    {insight.skus.map((sku, idx) => (
                      <span key={idx} className="ai-sku-tag">
                        {sku}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="ai-empty">
              <span className="ai-empty-icon"><TabIcon iconName={TABS.find((x) => x.key === tab)?.icon} /></span>
              <p>Chưa có gợi ý nào cho mục này.</p>
              <span className="ai-empty-sub">AI sẽ phân tích khi có đủ dữ liệu</span>
            </div>
          )}
        </div>
      )}

      {/* Selected SKUs Panel */}
      <div className="ai-selected-panel">
        <div className="ai-selected-header">
          <div>
            <strong>SKU đang chọn</strong>
            <span className="ai-selected-sub">Danh sách được lưu từ các gợi ý AI</span>
          </div>
          {draftItems.length > 0 && (
            <button
              className="ai-clear-btn"
              onClick={() => setDraftItems([])}
              type="button"
            >
              Xóa hết
            </button>
          )}
        </div>

        <div className="ai-selected-items">
          {draftItems.length === 0 ? (
            <span className="ai-selected-empty">Chưa có SKU nào được chọn</span>
          ) : (
            draftItems.map((sku) => (
              <span key={sku} className="ai-selected-sku">
                {sku}
                <button
                  className="ai-sku-remove"
                  onClick={() => removeSku(sku)}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
