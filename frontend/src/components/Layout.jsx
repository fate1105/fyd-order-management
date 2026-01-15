import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import "../css/layout.css";
import { isLoggedIn } from "../js/authSession.js";

const routesMeta = {
  "/": { kicker: "Tổng quan", title: "Dashboard" },
  "/orders": { kicker: "Vận hành", title: "Đơn hàng" },
  "/products": { kicker: "Kho", title: "Sản phẩm" },
  "/customers": { kicker: "CRM", title: "Khách hàng" },
  "/ai": { kicker: "AI", title: "Gợi ý sản phẩm" },

  // thêm mới
  "/revenue": { kicker: "Báo cáo", title: "Doanh thu" },
  "/inventory": { kicker: "Kho", title: "Tồn kho" },
  "/profile": { kicker: "Tài khoản", title: "Hồ sơ" },
};

export default function Layout() {
  // Guard: chưa login thì đá về /login
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const location = useLocation();

  // ✅ meta phải khai báo ở đây (trước return)
  const meta = routesMeta[location.pathname] || routesMeta["/"];

  return (
    <div className="appShell">
      <Sidebar />
      <div className="appMain">
        <Header kicker={meta.kicker} title={meta.title} />
        <main className="appContent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

