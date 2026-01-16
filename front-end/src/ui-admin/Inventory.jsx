import { useMemo, useState } from "react";
import "../css/dashboard.css";
import { productsSeed, formatVND } from "../js/mock.js";

function level(stock) {
  if (stock <= 0) return { tag: "Hết hàng", cls: "out" };
  if (stock <= 6) return { tag: "Sắp hết", cls: "low" };
  return { tag: "Ổn", cls: "" };
}

export default function Inventory() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all/low/out

  const items = useMemo(() => {
    return productsSeed
      .filter((p) => {
        const t = `${p.id} ${p.name} ${p.category}`.toLowerCase();
        const okQ = !q || t.includes(q.toLowerCase());
        const okF =
          filter === "all" ? true :
          filter === "low" ? (p.stock > 0 && p.stock <= 6) :
          (p.stock <= 0);
        return okQ && okF;
      })
      .sort((a, b) => a.stock - b.stock);
  }, [q, filter]);

  const summary = useMemo(() => {
    const low = productsSeed.filter(p => p.stock > 0 && p.stock <= 6).length;
    const out = productsSeed.filter(p => p.stock <= 0).length;
    return { low, out, total: productsSeed.length };
  }, []);

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Tồn kho</div>
          <div className="cardSub">Cảnh báo sắp hết/hết hàng (mock)</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input className="miniInput" placeholder="Tìm SKU/tên…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="miniSelect" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả ({summary.total})</option>
            <option value="low">Sắp hết ({summary.low})</option>
            <option value="out">Hết hàng ({summary.out})</option>
          </select>
        </div>
      </div>

      <div className="table">
        <div className="tr th">
          <div>SKU</div>
          <div>Sản phẩm</div>
          <div>Danh mục</div>
          <div>Giá</div>
          <div>Tồn</div>
        </div>

        {items.map((p) => {
          const lv = level(p.stock);
          return (
            <div className="tr" key={p.id}>
              <div className="mono">{p.id}</div>
              <div style={{ fontWeight: 850 }}>{p.name}</div>
              <div style={{ color: "var(--muted2)" }}>{p.category}</div>
              <div className="mono">{formatVND(p.price)}</div>
              <div>
                <span className={`badgeStock ${lv.cls}`}>{lv.tag} • {p.stock}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
