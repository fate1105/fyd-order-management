import { useMemo, useState } from "react";
import "../css/dashboard.css";
import { ordersSeed, formatVND, orderTotal } from "../js/mock.js";
import RevenueChart from "../components/RevenueChart";

function Stat({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ color: "var(--muted2)", fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 950, fontSize: 22, marginTop: 6 }}>{value}</div>
      {sub ? <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
}

export default function Revenue() {
  // ✅ chỉ giữ 1 state range, dùng number cho khỏi lệch key
  const [range, setRange] = useState(7);

  // ✅ MOCK đặt ngoài useMemo cũng ok, nhưng ở đây để trong component cho nhanh
  const MOCK = useMemo(() => {
    return {
      7: [
        { label: "T2", value: 120000 },
        { label: "T3", value: 350000 },
        { label: "T4", value: 280000 },
        { label: "T5", value: 500000 },
        { label: "T6", value: 420000 },
        { label: "T7", value: 300000 },
        { label: "CN", value: 200000 }
      ],
      30: Array.from({ length: 30 }, (_, i) => ({
        label: `${i + 1}`,
        value: Math.round(150000 + Math.random() * 450000)
      })),
      90: Array.from({ length: 12 }, (_, i) => ({
        label: `Tuần ${i + 1}`,
        value: Math.round(300000 + Math.random() * 1200000)
      }))
    };
  }, []);

  // ✅ chart sẽ đổi theo range
  const chartSeries = useMemo(() => {
    return MOCK[range] ?? MOCK[7];
  }, [MOCK, range]);

  // ✅ stats bạn đang tính theo ordersSeed (mock) — tạm thời ok
  // Nếu sau này muốn stats cũng đổi theo range thì lọc orders theo ngày là xong
  const stats = useMemo(() => {
    const total = ordersSeed.reduce((s, o) => s + orderTotal(o), 0);
    const completed = ordersSeed.filter(o => o.status === "Hoàn tất").reduce((s, o) => s + orderTotal(o), 0);
    const shipping = ordersSeed.filter(o => o.status === "Đang giao").reduce((s, o) => s + orderTotal(o), 0);
    const pending = ordersSeed.filter(o => o.status === "Chờ xử lý").reduce((s, o) => s + orderTotal(o), 0);
    const aov = ordersSeed.length ? Math.round(total / ordersSeed.length) : 0;
    return { total, completed, shipping, pending, aov };
  }, []);

  const topProducts = useMemo(() => {
    const map = new Map();
    for (const o of ordersSeed) {
      for (const it of o.items) {
        const cur = map.get(it.productId) || { id: it.productId, name: it.name, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.price;
        map.set(it.productId, cur);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, []);

  const rangeLabel = useMemo(() => {
    if (range === 7) return "7 ngày gần nhất";
    if (range === 30) return "30 ngày gần nhất";
    return "90 ngày gần nhất";
  }, [range]);

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Doanh thu</div>
          <div className="cardSub">Tổng hợp từ đơn hàng (mock) • Sau này backend chỉ cần thay data</div>
        </div>

        {/* ✅ value là number */}
        <select
          className="miniSelect"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
        >
          <option value={7}>7 ngày</option>
          <option value={30}>30 ngày</option>
          <option value={90}>90 ngày</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Stat label="Tổng doanh thu" value={formatVND(stats.total)} sub={`AOV: ${formatVND(stats.aov)}`} />
        <Stat label="Hoàn tất" value={formatVND(stats.completed)} sub="Đã thu" />
        <Stat label="Đang giao" value={formatVND(stats.shipping)} sub="Chưa đối soát" />
        <Stat label="Chờ xử lý" value={formatVND(stats.pending)} sub="Dự kiến" />
      </div>

      {/* ✅ Chart đặt đúng vị trí (mình để sau stats và trước top products cho hợp lý UI),
          nếu bạn muốn để cuối vẫn ok */}
      <div className="card chartCard" style={{ marginTop: 12 }}>
        <div className="chartHeader">
          <h3>Doanh thu theo ngày</h3>
          <span className="muted">{rangeLabel}</span>
        </div>

        {/* ✅ dùng chartSeries + key để remount khi đổi range */}
        <RevenueChart key={`rev-${range}`} data={chartSeries} />
      </div>

      <div className="hr" />

      <div className="cardTitle" style={{ fontSize: 14 }}>Top sản phẩm theo doanh thu</div>
      <div className="table" style={{ marginTop: 10 }}>
        <div className="tr th">
          <div>SKU</div>
          <div>Sản phẩm</div>
          <div>SL</div>
          <div>Doanh thu</div>
          <div></div>
        </div>

        {topProducts.map((p) => (
          <div className="tr" key={p.id}>
            <div className="mono">{p.id}</div>
            <div style={{ fontWeight: 800 }}>{p.name}</div>
            <div className="mono">{p.qty}</div>
            <div className="mono">{formatVND(p.revenue)}</div>
            <div />
          </div>
        ))}
      </div>
    </div>
  );
}
