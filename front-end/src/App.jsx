import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { initFacebookSdk } from "@shared/utils/facebookSdk.js";

// Admin feature
import {
  AdminLayout,
  Dashboard,
  Orders,
  Products,
  Customers,
  AI,
  Revenue,
  Inventory,
  Promotions,
  Tiers,
  Profile,
  FeaturedZones,
  FeaturedZoneEditor
} from "@admin";

// Auth feature
import { Login, VerifyOtp } from "@auth";

// Shop feature
import { Shop, CustomerProfile, Checkout, OrderSuccess, ProductDetail } from "@shop";

export default function App() {
  // Initialize Facebook SDK on mount
  useEffect(() => {
    initFacebookSdk();
  }, []);

  return (
    <Routes>
      {/* Default route -> Shop */}
      <Route path="/" element={<Navigate to="/shop" replace />} />

      {/* Shop pages */}
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/product/:productId" element={<ProductDetail />} />
      <Route path="/shop/profile" element={<CustomerProfile />} />
      <Route path="/shop/checkout" element={<Checkout />} />
      <Route path="/shop/order-success/:orderId" element={<OrderSuccess />} />

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/verify-otp" element={<VerifyOtp />} />

      {/* Admin pages (protected) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="ai" element={<AI />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="tiers" element={<Tiers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="featured" element={<FeaturedZones />} />
        <Route path="featured/:id" element={<FeaturedZoneEditor />} />
      </Route>

      {/* Legacy redirects */}
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/shop" replace />} />
    </Routes>
  );
}
