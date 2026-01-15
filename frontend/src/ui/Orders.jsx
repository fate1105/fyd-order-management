import { useMemo, useState } from "react";
import { formatVND, orderTotal, ordersSeed } from "../js/mock.js";
import "../css/dashboard.css";

const STATUS = ["Chờ xử lý", "Đang giao", "Hoàn tất", "Đã hủy"];

function Pill({ status }) {
  const cls =
    status === "Hoàn tất" ? "ok" :
    status === "Đang giao" ? "ship" :
    status === "Chờ xử lý" ? "pending" : "pending";
  return <span className={`pill ${cls}`}>{status}</span>;
}

function Drawer({ open, order, onClose, onUpdateStatus }) {
  if (!open || !order) return null;

  const total = orderTotal(order);

  return (
    <>
      <div className="drawerBackdrop" onMouseDown={onClose} />
      <aside className="drawer">
        <div className="drawerHead">
          <div>
            <div className="drawerTitle">{order.id}</div>
            <div className="drawerSub">
              {order.customer.name} • {order.customer.phone} • {order.time}
            </div>
          </div>
          <button className="iconBtn" type="button" onClick={onClose}>✕</button>
        </div>

        <div className="hr" />

        <div className="drawerSectionTitle">Trạng thái</div>
        <div className="chips">
          {STATUS.map((s) => (
            <button
              key={s}
              className={`chip ${order.status === s ? "on" : ""}`}
              onClick={() => onUpdateStatus(order.id, s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="drawerSectionTitle">Giao hàng</div>
        <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>
          <div><b>Địa chỉ:</b> {order.address}</div>
          <div><b>Thanh toán:</b> {order.payment}</div>
          {order.note ? <div><b>Ghi chú:</b> {order.note}</div> : null}
        </div>

        <div className="drawerSectionTitle">Sản phẩm</div>
        <div className="table">
          <div className="tr th">
            <div>Tên</div><div>SL</div><div>Giá</div><div>Tạm tính</div><div></div>
          </div>
          {order.items.map((it, idx) => (
            <div className="tr" key={idx}>
              <div>{it.name}</div>
              <div className="mono">{it.qty}</div>
              <div className="mono">{formatVND(it.price)}</div>
              <div className="mono">{formatVND(it.price * it.qty)}</div>
              <div />
            </div>
          ))}
        </div>

        <div className="hr" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "var(--muted)" }}>Tổng cộng</div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{formatVND(total)}</div>
        </div>

        <div className="hr" />
        <div className="rowActions">
          <button className="btnPrimary" type="button" onClick={() => alert("Demo: In hóa đơn")}>In hóa đơn</button>
          <button className="btnGhost" type="button" onClick={() => alert("Demo: Hoàn/huỷ")}>Hoàn/huỷ</button>
        </div>
      </aside>
    </>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(ordersSeed);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) || null, [orders, selectedId]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const okQ =
        !q ||
        o.id.toLowerCase().includes(q.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(q.toLowerCase()) ||
        o.customer.phone.includes(q);
      const okS = chip === "all" ? true : o.status === chip;
      return okQ && okS;
    });
  }, [orders, q, chip]);

  const counters = useMemo(() => {
    const c = { all: orders.length };
    for (const s of STATUS) c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  const updateStatus = (id, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Đơn hàng</div>
          <div className="cardSub">Filter chips • Drawer chi tiết • Đổi trạng thái (mock)</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input
            className="miniInput"
            placeholder="Tìm mã / khách / SĐT…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btnPrimary" type="button" onClick={() => alert("Demo: mở form tạo đơn (bạn đã có ở Dashboard)")} >
            + Tạo đơn
          </button>
        </div>
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        <button className={`chip ${chip === "all" ? "on" : ""}`} onClick={() => setChip("all")} type="button">
          Tất cả ({counters.all})
        </button>
        {STATUS.map((s) => (
          <button key={s} className={`chip ${chip === s ? "on" : ""}`} onClick={() => setChip(s)} type="button">
            {s} ({counters[s] || 0})
          </button>
        ))}
      </div>

      <div className="table">
        <div className="tr th">
          <div>Mã</div>
          <div>Khách</div>
          <div>Tổng</div>
          <div>Trạng thái</div>
          <div>Hành động</div>
        </div>

        {filtered.map((o) => (
          <div className="tr" key={o.id}>
            <div className="mono">{o.id}</div>
            <div>
              <div style={{ fontWeight: 800 }}>{o.customer.name}</div>
              <div style={{ color: "var(--muted2)", fontSize: 12 }}>{o.customer.phone}</div>
            </div>
            <div className="mono">{formatVND(orderTotal(o))}</div>
            <div><Pill status={o.status} /></div>
            <div className="rowActions">
              <button className="linkBtn" type="button" onClick={() => setSelectedId(o.id)}>Xem</button>
              <button className="linkBtn" type="button" onClick={() => updateStatus(o.id, o.status === "Chờ xử lý" ? "Đang giao" : "Hoàn tất")}>
                Quick update
              </button>
            </div>
          </div>
        ))}
      </div>

      <Drawer
        open={!!selected}
        order={selected}
        onClose={() => setSelectedId(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}
