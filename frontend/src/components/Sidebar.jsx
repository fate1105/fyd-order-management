import { NavLink } from "react-router-dom";
import "../css/sidebar.css";

const Item = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
  >
    <span className="navIcon" aria-hidden="true">{icon}</span>
    <span className="navLabel">{label}</span>
    {badge ? <span className="navBadge">{badge}</span> : null}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <div className="brandMark">FYD</div>
        <div className="brandText">
          <div className="brandName">FYD Admin</div>
          <div className="brandSub">Order • Inventory • AI</div>
        </div>
      </NavLink>

      <div className="navGroupTitle">TỔNG QUAN</div>
      <div className="navGroup">
        <Item to="/" icon="▦" label="Dashboard" />
        <Item to="/orders" icon="🧾" label="Đơn hàng" badge="12" />
        <Item to="/products" icon="📦" label="Sản phẩm" />
        <Item to="/customers" icon="👥" label="Khách hàng" />
      </div>

      <div className="navGroupTitle">AI & BÁO CÁO</div>
      <div className="navGroup">
        <Item to="/ai" icon="✨" label="AI gợi ý" />
        <Item to="/revenue" icon="📈" label="Doanh thu" />
        <Item to="/inventory" icon="🏷️" label="Tồn kho" />
      </div>

      <div className="sidebarFooter">
        <div className="miniCard">
          <div className="miniTitle">FYD Insight</div>
          <div className="miniText">Gợi ý dựa trên hành vi mua hàng & xu hướng.</div>
          <div className="miniTag">AI Ready</div>
        </div>
      </div>
    </aside>
  );
}
