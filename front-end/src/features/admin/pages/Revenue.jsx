import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import "../styles/pages.css";
import api, { formatVND } from "@shared/utils/api.js";
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
  const [range, setRange] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      setLoading(true);
      try {
        const res = await api.dashboard.getRevenue(range);
        setData(res);
      } catch (error) {
        console.error("Failed to load revenue data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRevenue();
  }, [range]);

  const stats = data ? {
    total: data.totalRevenue,
    completed: data.completedOrders,
    shipping: data.shippingOrders,
    pending: data.pendingOrders,
    aov: data.totalRevenue / ((data.completedOrders + data.shippingOrders + data.pendingOrders) || 1)
  } : { total: 0, completed: 0, shipping: 0, pending: 0, aov: 0 };

  const chartData = data?.chartData || [];
  const topProducts = data?.topProducts || [];

  const rangeLabel = {
    7: "7 ngày gần nhất",
    30: "30 ngày gần nhất",
    90: "90 ngày gần nhất"
  }[range] || "7 ngày gần nhất";

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Doanh thu</div>
          <div className="cardSub">Dữ liệu tài chính thực tế từ hệ thống</div>
        </div>

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

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>ĐANG TẢI...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Stat label="Tổng doanh thu" value={formatVND(stats.total)} sub={`AOV: ${formatVND(stats.aov)}`} />
            <Stat label="Hoàn tất" value={stats.completed} sub="Đơn đã giao" />
            <Stat label="Đang giao" value={stats.shipping} sub="Đơn vận chuyển" />
            <Stat label="Chờ xử lý" value={stats.pending} sub="Đơn mới" />
          </div>

          <div className="card chartCard" style={{ marginTop: 12 }}>
            <div className="chartHeader">
              <h3>Doanh thu theo ngày</h3>
              <span className="muted">{rangeLabel}</span>
            </div>
            <RevenueChart key={`rev-${range}`} data={chartData} />
          </div>

          <div className="hr" />

          <div className="cardTitle" style={{ fontSize: 14 }}>Top sản phẩm theo doanh thu</div>
          <div className="table" style={{ marginTop: 10 }}>
            <div className="tr th">
              <div>ID</div>
              <div>Sản phẩm</div>
              <div>SL bán</div>
              <div>Doanh thu</div>
            </div>

            {topProducts.map((p) => (
              <div className="tr" key={p.id}>
                <div className="mono">#{p.id}</div>
                <div style={{ fontWeight: 800 }}>{p.name}</div>
                <div className="mono">{p.qty}</div>
                <div className="mono" style={{ fontWeight: '700' }}>{formatVND(p.revenue)}</div>
              </div>
            ))}
            {topProducts.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Chưa có dữ liệu sản phẩm.</div>}
          </div>
        </>
      )}
    </div>
  );
}
