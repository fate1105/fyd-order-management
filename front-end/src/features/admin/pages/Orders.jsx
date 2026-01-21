import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/dashboard.css";
import "../styles/pages.css";
import api, { formatVND, ORDER_STATUS } from "@shared/utils/api.js";

// Define status map locally as fallback
const STATUS_MAP = {
  all: "Tất cả",
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Hoàn tất",
  COMPLETED: "Hoàn thành",
  PENDING_CANCEL: "Chờ duyệt hủy",
  CANCELLED: "Đã hủy",
};

// Icons
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function Pill({ status }) {
  const statusConfig = {
    DELIVERED: { cls: "ok", label: "Hoàn tất" },
    COMPLETED: { cls: "ok", label: "Hoàn thành" },
    SHIPPING: { cls: "ship", label: "Đang giao" },
    PENDING: { cls: "pending", label: "Chờ xử lý" },
    PENDING_CANCEL: { cls: "cancel", label: "Chờ duyệt hủy" },
    CANCELLED: { cls: "cancel", label: "Đã hủy" },
  };
  const config = statusConfig[status] || { cls: "pending", label: status };
  const label = ORDER_STATUS?.[status] || STATUS_MAP[status] || config.label;
  return <span className={`pill ${config.cls}`}>{label}</span>;
}

function Drawer({ open, order, onClose, onUpdateStatus }) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  if (!open || !order) return null;

  const statusEntries = Object.entries(STATUS_MAP || {}).filter(([k]) => k !== 'all');

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const content = (
    <>
      <div className="drawerBackdrop" onMouseDown={onClose} />
      <aside className="drawer drawer-enhanced">
        {/* Header */}
        <div className="drawer-header-enhanced">
          <div className="drawer-header-top">
            <div className="drawer-order-id">
              <span className="order-hash">#</span>
              {order.orderNumber || order.id}
            </div>
            <button className="iconBtn" type="button" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div className="drawer-header-meta">
            <Pill status={order.status} />
            <span className="drawer-date">
              <CalendarIcon /> {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Customer Card */}
        <div className="drawer-card">
          <div className="drawer-card-header">
            <UserIcon /> Khách hàng
          </div>
          <div className="drawer-customer-info">
            <div className="customer-avatar">
              {(order.customer?.fullName || order.shippingName || "K").charAt(0).toUpperCase()}
            </div>
            <div className="customer-details">
              <div className="customer-name">{order.customer?.fullName || order.shippingName || "Khách lẻ"}</div>
              <div className="customer-contact">
                <span><PhoneIcon /> {order.customer?.phone || order.shippingPhone || "—"}</span>
                {order.customer?.email && <span>{order.customer.email}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Card */}
        <div className="drawer-card">
          <div className="drawer-card-header">
            <MapPinIcon /> Địa chỉ giao hàng
          </div>
          <div className="drawer-address">
            <div className="address-name">{order.shippingName}</div>
            <div className="address-phone"><PhoneIcon /> {order.shippingPhone}</div>
            <div className="address-full">{order.shippingAddress || order.fullAddress || "—"}</div>
          </div>
        </div>

        {/* Products */}
        <div className="drawer-card">
          <div className="drawer-card-header">
            Sản phẩm ({order.items?.length || 0})
          </div>
          <div className="drawer-products">
            {order.items?.map((it, idx) => (
              <div className="drawer-product-item" key={idx}>
                <div className="product-thumb">
                  {it.productImage ? (
                    <img src={it.productImage} alt={it.productName} />
                  ) : (
                    <div className="product-thumb-placeholder">
                      {it.productName?.charAt(0) || "P"}
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <div className="product-name">{it.productName}</div>
                  {it.variantInfo && <div className="product-variant">{it.variantInfo}</div>}
                </div>
                <div className="product-qty">×{it.quantity}</div>
                <div className="product-price">{formatVND(it.lineTotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="drawer-card drawer-summary-card">
          <div className="drawer-card-header">
            <CreditCardIcon /> Thanh toán
          </div>
          <div className="drawer-payment-info">
            <div className="payment-method">
              {order.paymentMethod || "COD"}
              <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>
          </div>
          <div className="drawer-summary">
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{formatVND(order.subtotal || order.totalAmount)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{formatVND(order.shippingFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá</span>
                <span>-{formatVND(order.discount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{formatVND(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        {order.notes && (
          <div className="drawer-card drawer-note">
            <div className="drawer-card-header">Ghi chú</div>
            <p>{order.notes}</p>
          </div>
        )}

        {/* Status Update Actions */}
        <div className="drawer-actions">
          <div className="drawer-section-label">Cập nhật trạng thái</div>
          <div className="custom-select-wrapper">
            <div
              className={`custom-select-trigger ${isStatusOpen ? 'active' : ''}`}
              onClick={() => setIsStatusOpen(!isStatusOpen)}
            >
              <span>{STATUS_MAP[order.status] || order.status}</span>
              <span className="custom-select-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className={`custom-options ${isStatusOpen ? 'show' : ''}`}>
              {statusEntries.map(([k, v]) => (
                <div
                  key={k}
                  className={`custom-option ${order.status === k ? 'selected' : ''}`}
                  onClick={() => {
                    onUpdateStatus(order.id, k);
                    setIsStatusOpen(false);
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );

  return createPortal(content, document.body);
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ all: 0 });

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const params = { q };
        if (chip !== "all") params.status = chip;
        const res = await api.order.getAll(params);
        // API returns { orders: [], totalItems, statusCounts, ... }
        const list = res.orders || res.content || res || [];
        setOrders(Array.isArray(list) ? list : []);
        setStats(prev => ({ ...prev, all: res.totalItems || res.totalElements || list.length }));
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [q, chip]);

  const selected = orders.find((o) => o.id === selectedId) || null;

  const updateStatus = async (id, newStatus) => {
    try {
      await api.order.updateStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    } catch (error) {
      alert("Lỗi cập nhật trạng thái: " + error.message);
    }
  };

  // Ensure STATUS_MAP is always valid
  const statusEntries = Object.entries(STATUS_MAP || {});

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Đơn hàng</div>
          <div className="cardSub">Quản lý và xử lý đơn hàng thời gian thực</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input
            className="miniInput"
            placeholder="Tìm mã / khách / SĐT…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        {statusEntries.map(([k, v]) => (
          <button key={k} className={`chip ${chip === k ? "on" : ""}`} onClick={() => setChip(k)} type="button">
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          <div style={{ fontWeight: '700' }}>ĐANG TẢI...</div>
        </div>
      ) : (
        <div className="table">
          <div className="tr th">
            <div>Mã</div>
            <div>Khách</div>
            <div>Tổng</div>
            <div>Trạng thái</div>
            <div>Hành động</div>
          </div>

          {orders.map((o) => (
            <div className="tr" key={o.id}>
              <div className="mono">#{o.orderNumber || o.id}</div>
              <div>
                <div style={{ fontWeight: 800 }}>{o.customer?.fullName || o.shippingName}</div>
                <div style={{ color: "var(--admin-text-muted-2)", fontSize: 12 }}>{o.customer?.phone || o.shippingPhone}</div>
              </div>
              <div className="mono" style={{ fontWeight: '700' }}>{formatVND(o.totalAmount)}</div>
              <div><Pill status={o.status} /></div>
              <div className="rowActions">
                <button className="linkBtn" type="button" onClick={() => setSelectedId(o.id)}>Xem chi tiết</button>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>Không tìm thấy đơn hàng nào.</div>}
        </div>
      )}

      <Drawer
        open={!!selected}
        order={selected}
        onClose={() => setSelectedId(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}
