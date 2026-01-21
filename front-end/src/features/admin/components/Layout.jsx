import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import "../styles/layout.css";
import "../styles/admin-theme.css";
import { isLoggedIn } from "@shared/utils/authSession.js";
import { NotificationProvider } from "../hooks/useNotifications.jsx";

const routesMeta = [
  { path: "/admin/orders", kicker: "Tổng quan", title: "Đơn hàng" },
  { path: "/admin/products", kicker: "Tổng quan", title: "Sản phẩm" },
  { path: "/admin/customers", kicker: "Tổng quan", title: "Khách hàng" },
  { path: "/admin/promotions", kicker: "Marketing", title: "Khuyến mãi" },
  { path: "/admin/featured", kicker: "Marketing", title: "Vùng nổi bật" },
  { path: "/admin/tiers", kicker: "Marketing", title: "Hạng thành viên" },
  { path: "/admin/ai", kicker: "Phân tích", title: "AI Gợi ý" },
  { path: "/admin/revenue", kicker: "Phân tích", title: "Doanh thu" },
  { path: "/admin/inventory", kicker: "Phân tích", title: "Tồn kho" },
  { path: "/admin/profile", kicker: "Tài khoản", title: "Hồ sơ cá nhân" },
  { path: "/admin", kicker: "Tổng quan", title: "Dashboard" },
];

export default function Layout() {
  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  const location = useLocation();
  // Find metadata matching the current path (longest match first)
  const meta = routesMeta.find(m => location.pathname.startsWith(m.path)) || routesMeta[routesMeta.length - 1];

  return (
    <NotificationProvider>
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
    </NotificationProvider>
  );
}

