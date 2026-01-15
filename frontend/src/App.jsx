import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";

import Dashboard from "./ui/Dashboard.jsx";
import Orders from "./ui/Orders.jsx";
import Products from "./ui/Products.jsx";
import Customers from "./ui/Customers.jsx";
import AI from "./ui/AI.jsx";
import Revenue from "./ui/Revenue.jsx";
import Inventory from "./ui/Inventory.jsx";
import Login from "./ui/Login.jsx";
import Register from "./ui/Register.jsx";
import VerifyOtp from "./ui/VerifyOtp.jsx";

export default function App() {
  return (
    <Routes>
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

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
