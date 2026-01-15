import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import { kpis, ordersSeed, aiSuggestions, formatVND, orderTotal } from "../js/mock.js";

function HeroArt() {
  return (
    <svg className="heroArt" viewBox="0 0 520 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 190C120 110 170 140 250 110C330 80 360 40 480 60" stroke="rgba(75,240,200,0.55)" strokeWidth="3" />
      <path d="M40 160C120 80 200 120 260 90C340 50 380 20 480 40" stroke="rgba(110,168,255,0.55)" strokeWidth="3" />
      <circle cx="110" cy="150" r="16" fill="rgba(75,240,200,0.18)" stroke="rgba(75,240,200,0.55)" />
      <circle cx="260" cy="105" r="18" fill="rgba(110,168,255,0.16)" stroke="rgba(110,168,255,0.55)" />
      <circle cx="420" cy="62" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" />
      <rect x="70" y="40" width="170" height="110" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <rect x="92" y="68" width="126" height="14" rx="7" fill="rgba(255,255,255,0.10)" />
      <rect x="92" y="92" width="92" height="14" rx="7" fill="rgba(255,255,255,0.10)" />
      <rect x="92" y="116" width="110" height="14" rx="7" fill="rgba(255,255,255,0.10)" />
      <rect x="300" y="95" width="150" height="95" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <rect x="322" y="122" width="104" height="14" rx="7" fill="rgba(75,240,200,0.14)" />
      <rect x="322" y="148" width="80" height="14" rx="7" fill="rgba(110,168,255,0.14)" />
    </svg>
  );
}

const KPI = ({ title, value, trend }) => (
  <div className="card kpi">
    <div className="kpiTop">
      <div className="kpiTitle">{title}</div>
      <div className={`kpiTrend ${trend?.type || ""}`}>{trend?.label}</div>
    </div>
    <div className="kpiValue">{value}</div>
  </div>
);

const StatusPill = ({ status }) => {
  const cls =
    status === "Hoàn tất" ? "ok" : status === "Đang giao" ? "ship" : "pending";
  return <span className={`pill ${cls}`}>{status}</span>;
};

function MiniAvatar({ name }) {
  const ch = (name || "?").trim().slice(0, 1).toUpperCase();
  return <div className="miniAvatar">{ch}</div>;
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">{title}</div>
          <button className="iconBtn" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="dash">
      <section className="dashHero">
        <div className="heroCard">
          <div className="heroTop">
            <div>
              <div className="heroTitle">FYD Order Management</div>
              <div className="heroDesc">
                Quản lý đơn, sản phẩm, khách hàng + AI gợi ý — thao tác nhanh, tối giản.
              </div>

              <div className="heroActions">
                <button className="btnPrimary" type="button" onClick={() => setOpenCreate(true)}>
                  + Tạo đơn
                </button>
                <button className="btnGhost" type="button" onClick={() => nav("/ai")}>
                  Xem AI gợi ý
                </button>
              </div>

              <div className="heroBadges">
                <span className="badge">Realtime-ready</span>
                <span className="badge">AI Module</span>
                <span className="badge">Clean Admin</span>
              </div>
            </div>

            <HeroArt />
          </div>
        </div>

        <div className="card note">
          <div className="noteTitle">AI Quick Tip</div>
          <div className="noteText">
            Gợi ý “mua kèm” ngay lúc tạo đơn giúp tăng AOV.
          </div>
          <button className="linkBtn" type="button" onClick={() => nav("/ai")}>
            Chi tiết →
          </button>
        </div>
      </section>

      <section className="kpiGrid">
        {kpis.map((k, i) => <KPI key={i} {...k} />)}
      </section>

      <section className="grid2">
        <div className="card tableCard">
          <div className="cardHead">
            <div>
              <div className="cardTitle">Đơn hàng gần đây</div>
              <div className="cardSub">Demo UI (mock)</div>
            </div>
            <button className="linkBtn" type="button" onClick={() => nav("/orders")}>
              Xem tất cả →
            </button>
          </div>

          <div className="table">
            <div className="tr th">
              <div>Khách</div>
              <div>Mã</div>
              <div>Tổng</div>
              <div>Trạng thái</div>
              <div>Giờ</div>
            </div>

            {ordersSeed.map((o) => (
              <div className="tr" key={o.id}>
                <div className="cellFlex">
                  <MiniAvatar name={o.customer.name} />
                  <div className="nameStack">
                    <div className="nameMain">{o.customer.name}</div>
                    <div className="nameSub">{o.customer.phone}</div>
                  </div>
                </div>

                <div className="mono">{o.id}</div>
                <div className="mono">{formatVND(orderTotal(o))}</div>
                <div><StatusPill status={o.status} /></div>
                <div className="mono">{o.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card aiCard">
          <div className="cardHead">
            <div>
              <div className="cardTitle">AI gợi ý nhanh</div>
              <div className="cardSub">3 tín hiệu tiêu biểu</div>
            </div>
            <button className="linkBtn" type="button" onClick={() => nav("/ai")}>
              Mở AI →
            </button>
          </div>

          <div className="aiList">
            {aiSuggestions.map((s, i) => (
              <div className="aiItem" key={i}>
                <div className="thumb" aria-hidden="true" />
                <div>
                  <div className="aiTitle">{s.title}</div>
                  <div className="aiDesc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="aiFooter">
            <button className="btnPrimary wide" type="button" onClick={() => nav("/ai")}>
              Xem đề xuất chi tiết
            </button>
          </div>
        </div>
      </section>

      <Modal open={openCreate} title="Tạo đơn mới (Demo UI)" onClose={() => setOpenCreate(false)}>
        <div className="formGrid">
          <label className="field">
            <span>Khách hàng</span>
            <input placeholder="VD: Ngọc Anh" />
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input placeholder="VD: 09xx..." />
          </label>
          <label className="field">
            <span>Sản phẩm</span>
            <input placeholder="VD: Hoodie đen" />
          </label>
          <label className="field">
            <span>Số lượng</span>
            <input placeholder="1" />
          </label>
        </div>

        <div className="modalActions">
          <button className="btnGhost" type="button" onClick={() => setOpenCreate(false)}>
            Hủy
          </button>
          <button
            className="btnPrimary"
            type="button"
            onClick={() => {
              setOpenCreate(false);
              nav("/orders");
            }}
          >
            Lưu (demo)
          </button>
        </div>
      </Modal>
    </div>
  );
}
