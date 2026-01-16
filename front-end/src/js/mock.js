export const kpis = [
  { title: "Doanh thu hôm nay", value: "12.450.000₫", trend: { type: "up", label: "+8.2%" } },
  { title: "Đơn chờ xử lý", value: "12", trend: { type: "warn", label: "Ưu tiên" } },
  { title: "Tỉ lệ hoàn", value: "1.7%", trend: { type: "down", label: "-0.3%" } },
  { title: "Sản phẩm sắp hết", value: "9", trend: { type: "warn", label: "Cảnh báo" } },
];

export const aiSuggestions = [
  { type: "bundle", title: "Thường mua kèm", desc: "Áo thun FYD → Túi tote FYD", score: 0.71, items: ["FYD-TS-BSC", "FYD-TT-001"] },
  { type: "similar", title: "Sản phẩm tương tự", desc: "Hoodie đen → Hoodie xám", score: 0.83, items: ["FYD-HD-BLK", "FYD-HD-GRY"] },
  { type: "trend", title: "Xu hướng", desc: "Nón lưỡi trai tăng mạnh 7 ngày gần nhất", score: 0.66, items: ["FYD-CAP-01"] },
];

export const productsSeed = [
  { id: "FYD-HD-BLK", name: "Hoodie FYD Đen", category: "Hoodie", price: 490000, stock: 18 },
  { id: "FYD-HD-GRY", name: "Hoodie FYD Xám", category: "Hoodie", price: 490000, stock: 7 },
  { id: "FYD-TS-BSC", name: "Áo thun FYD Basic", category: "T-shirt", price: 220000, stock: 42 },
  { id: "FYD-TT-001", name: "Túi tote FYD", category: "Accessories", price: 150000, stock: 12 },
  { id: "FYD-CAP-01", name: "Nón lưỡi trai FYD", category: "Accessories", price: 180000, stock: 5 },
];

export const ordersSeed = [
  {
    id: "#FYD-10241",
    customer: { name: "Ngọc Anh", phone: "0901 234 567" },
    time: "10:24",
    status: "Đang giao",
    address: "139 Nguyễn Du, P. Bến Thành, TP.HCM",
    note: "Giao giờ hành chính.",
    items: [
      { productId: "FYD-TS-BSC", name: "Áo thun FYD Basic", price: 220000, qty: 1 },
      { productId: "FYD-TT-001", name: "Túi tote FYD", price: 150000, qty: 1 },
    ],
    payment: "COD",
  },
  {
    id: "#FYD-10240",
    customer: { name: "Minh Khang", phone: "0933 111 222" },
    time: "09:58",
    status: "Chờ xử lý",
    address: "Q. Bình Thạnh, TP.HCM",
    note: "Gọi trước khi giao.",
    items: [{ productId: "FYD-HD-BLK", name: "Hoodie FYD Đen", price: 490000, qty: 2 }],
    payment: "Momo",
  },
  {
    id: "#FYD-10239",
    customer: { name: "Thảo Vy", phone: "0988 333 999" },
    time: "09:10",
    status: "Hoàn tất",
    address: "TP. Thủ Đức, TP.HCM",
    note: "",
    items: [{ productId: "FYD-CAP-01", name: "Nón lưỡi trai FYD", price: 180000, qty: 1 }],
    payment: "Banking",
  },
  {
    id: "#FYD-10238",
    customer: { name: "Quốc Bảo", phone: "0912 888 777" },
    time: "08:32",
    status: "Hoàn tất",
    address: "Q. 10, TP.HCM",
    note: "",
    items: [
      { productId: "FYD-HD-GRY", name: "Hoodie FYD Xám", price: 490000, qty: 1 },
      { productId: "FYD-TT-001", name: "Túi tote FYD", price: 150000, qty: 1 },
    ],
    payment: "COD",
  },
];

// helpers
export function formatVND(n) {
  try {
    return new Intl.NumberFormat("vi-VN").format(n) + "₫";
  } catch {
    return `${n}₫`;
  }
}
export function orderTotal(order) {
  return order.items.reduce((sum, it) => sum + it.price * it.qty, 0);
}
