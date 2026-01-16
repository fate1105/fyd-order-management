import { NavLink } from "react-router-dom";
import "../../css/sidebar.css";

// SVG Icons
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h6"/>
      <path d="M9 16h6"/>
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  customers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  ai: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  revenue: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  inventory: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  shop: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
};

const Item = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
    end={to === "/admin"}
  >
    <span className="navIcon" aria-hidden="true">{icon}</span>
    <span className="navLabel">{label}</span>
    {badge ? <span className="navBadge">{badge}</span> : null}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/admin" className="brand">
        <div className="brandMark">FYD</div>
        <div className="brandText">
          <div className="brandName">FYD Admin</div>
          <div className="brandSub">Quản lý cửa hàng</div>
        </div>
      </NavLink>

      <div className="navGroupTitle">TỔNG QUAN</div>
      <div className="navGroup">
        <Item to="/admin" icon={icons.dashboard} label="Dashboard" />
        <Item to="/admin/orders" icon={icons.orders} label="Đơn hàng" />
        <Item to="/admin/products" icon={icons.products} label="Sản phẩm" />
        <Item to="/admin/customers" icon={icons.customers} label="Khách hàng" />
      </div>

      <div className="navGroupTitle">PHÂN TÍCH</div>
      <div className="navGroup">
        <Item to="/admin/ai" icon={icons.ai} label="AI Gợi ý" />
        <Item to="/admin/revenue" icon={icons.revenue} label="Doanh thu" />
        <Item to="/admin/inventory" icon={icons.inventory} label="Tồn kho" />
      </div>

      <div className="sidebarFooter">
        <a href="/" className="back-shop-btn">
          {icons.shop}
          <span>Xem cửa hàng</span>
        </a>
      </div>
    </aside>
  );
}
