import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import "../styles/pages.css";
import api, { formatVND } from "@shared/utils/api.js";

export default function Customers() {
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState([]);
  const [tierCounts, setTierCounts] = useState({ all: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await api.customer.getAll({ q });
        setCustomers(res.customers || []);
        setTierCounts(res.tierCounts || { all: 0 });
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [q]);

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Khách hàng</div>
          <div className="cardSub">Dữ liệu khách hàng trên toàn hệ thống</div>
        </div>

        <input
          className="miniInput"
          placeholder="Tìm tên / SĐT / Email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        <button className="chip on" type="button">Tất cả ({tierCounts.all})</button>
        {Object.entries(tierCounts).filter(([k]) => k !== 'all' && tierCounts[k] > 0).map(([k, v]) => (
          <button key={k} className="chip" type="button">{k} ({v})</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>ĐANG TẢI...</div>
      ) : (
        <div className="table">
          <div className="tr th">
            <div>Khách</div>
            <div>SĐT</div>
            <div>Hạng</div>
            <div>Số đơn</div>
            <div>Chi tiêu</div>
          </div>

          {customers.map((c) => (
            <div className="tr" key={c.id}>
              <div className="cellFlex">
                <div className="miniAvatar">{(c.fullName || "?").slice(0, 1).toUpperCase()}</div>
                <div className="nameStack">
                  <div className="nameMain">{c.fullName}</div>
                  <div className="nameSub">{c.email || "Chưa có email"}</div>
                </div>
              </div>

              <div className="mono" style={{ fontWeight: '500' }}>{c.phone}</div>
              <div>
                <span className={`pill ${c.tier === "VIP" ? "ship" : c.tier === "Gold" ? "ok" : "pending"}`}>
                  {c.tier || "Member"}
                </span>
              </div>
              <div className="mono" style={{ textAlign: 'center' }}>{c.totalOrders || 0}</div>
              <div className="mono" style={{ fontWeight: '700' }}>{formatVND(c.totalSpent || 0)}</div>
            </div>
          ))}
          {customers.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Không tìm thấy khách hàng nào.</div>}
        </div>
      )}
    </div>
  );
}
