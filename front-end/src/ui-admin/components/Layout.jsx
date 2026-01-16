import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import "../../css/layout.css";
import "../../css/admin-theme.css";
import { isLoggedIn } from "../../js/authSession.js";

const routesMeta = {
  "/admin": { kicker: "Tổng quan", title: "Dashboard" },
  "/admin/orders": { kicker: "Vận hành", title: "Đơn hàng" },
  "/admin/products": { kicker: "Kho", title: "Sản phẩm" },
  "/admin/customers": { kicker: "CRM", title: "Khách hàng" },
  "/admin/ai": { kicker: "AI", title: "Gợi ý thông minh" },
  "/admin/revenue": { kicker: "Báo cáo", title: "Doanh thu" },
  "/admin/inventory": { kicker: "Kho", title: "Tồn kho" },
  "/admin/profile": { kicker: "Tài khoản", title: "Hồ sơ cá nhân" },
};

export default function Layout() {
  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  const location = useLocation();
  const meta = routesMeta[location.pathname] || routesMeta["/admin"];

  return (
    <div className="admin-shell">
      <div className="appShell">
        <Sidebar />
        <div className="appMain">
          <Header kicker={meta.kicker} title={meta.title} />
          <main className="appContent">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
