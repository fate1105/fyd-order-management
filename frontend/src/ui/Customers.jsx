import { useMemo, useState } from "react";
import "../css/dashboard.css";
import { ordersSeed, formatVND, orderTotal } from "../js/mock.js";

export default function Customers() {
  const [q, setQ] = useState("");

  const customers = useMemo(() => {
    // gom khách từ ordersSeed
    const map = new Map();
    for (const o of ordersSeed) {
      const key = o.customer.phone;
      const prev = map.get(key);
      const spend = orderTotal(o);

      if (!prev) {
        map.set(key, {
          name: o.customer.name,
          phone: o.customer.phone,
          orders: 1,
          spend,
        });
      } else {
        map.set(key, {
          ...prev,
          orders: prev.orders + 1,
          spend: prev.spend + spend,
        });
      }
    }

    // tier demo
    const arr = Array.from(map.values()).map((c) => ({
      ...c,
      tier: c.spend >= 2000000 ? "VIP" : c.orders >= 2 ? "Member" : "New",
    }));

    // search
    return arr.filter((c) => {
      const text = `${c.name} ${c.phone}`.toLowerCase();
      return !q || text.includes(q.toLowerCase());
    });
  }, [q]);

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Khách hàng</div>
          <div className="cardSub">Tổng hợp từ lịch sử đơn hàng (mock)</div>
        </div>

        <input
          className="miniInput"
          placeholder="Tìm tên / SĐT…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="table">
        <div className="tr th">
          <div>Khách</div>
          <div>SĐT</div>
          <div>Tier</div>
          <div>Số đơn</div>
          <div>Tổng chi</div>
        </div>

        {customers.map((c) => (
          <div className="tr" key={c.phone}>
            <div className="cellFlex">
              <div className="miniAvatar">{c.name.slice(0, 1).toUpperCase()}</div>
              <div className="nameStack">
                <div className="nameMain">{c.name}</div>
                <div className="nameSub">FYD Customer</div>
              </div>
            </div>

            <div className="mono">{c.phone}</div>
            <div>
              <span className={`pill ${c.tier === "VIP" ? "ship" : c.tier === "Member" ? "ok" : "pending"}`}>
                {c.tier}
              </span>
            </div>
            <div className="mono">{c.orders}</div>
            <div className="mono">{formatVND(c.spend)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
