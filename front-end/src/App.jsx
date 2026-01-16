import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";

// admin pages
import Dashboard from "./ui-admin/Dashboard";
import Orders from "./ui-admin/Orders";
import Products from "./ui-admin/Products";
import Customers from "./ui-admin/Customers";
import AI from "./ui-admin/AI";
import Revenue from "./ui-admin/Revenue";
import Inventory from "./ui-admin/Inventory";
import Profile from "./ui-admin/Profile";

// auth pages
import Login from "./ui-auth/Login";
import Register from "./ui-auth/Register";
import VerifyOtp from "./ui-auth/VerifyOtp";

// customer pages
import Shop from "./ui-customer/Shop";


export default function App() {
  return (
    <Routes>
      {/* Customer pages (public) */}
      <Route path="/shop" element={<Shop />} />

      {/* Auth pages (no sidebar/header) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* App pages */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/profile" element={<Profile />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
