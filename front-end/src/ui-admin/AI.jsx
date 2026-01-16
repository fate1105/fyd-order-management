import { useMemo, useState } from "react";
import "../css/dashboard.css";
import { aiSuggestions } from "../js/mock.js";

const TABS = [
  { key: "bundle", label: "Mua kèm", desc: "Từ lịch sử giỏ hàng: sản phẩm thường xuất hiện cùng nhau." },
  { key: "similar", label: "Tương tự", desc: "Dựa trên danh mục/đặc điểm: gợi ý thay thế gần nhất." },
  { key: "trend", label: "Xu hướng", desc: "Ưu tiên sản phẩm đang tăng trưởng trong 7 ngày gần nhất." },
];

export default function AI() {
  const [tab, setTab] = useState("bundle");

  // mock: “đơn đang thao tác”
  const [draftItems, setDraftItems] = useState([]);

  const list = useMemo(() => aiSuggestions.filter((x) => x.type === tab), [tab]);

  const apply = (s) => {
    setDraftItems((prev) => {
      const merged = new Set([...prev, ...(s.items || [])]);
      return Array.from(merged);
    });
  };

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">AI gợi ý sản phẩm</div>
          <div className="cardSub">Explanation • Score bar • Apply to order (mock)</div>
        </div>
      </div>

      <div className="chips" style={{ marginBottom: 10 }}>
        {TABS.map((t) => (
          <button key={t.key} className={`chip ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)} type="button">
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>
        <b style={{ color: "var(--text)" }}>{TABS.find((x) => x.key === tab)?.label}:</b>{" "}
        {TABS.find((x) => x.key === tab)?.desc}
      </div>

      <div className="aiList">
        {list.map((s, i) => (
          <div className="aiItem" key={i}>
            <div className="thumb" aria-hidden="true" />
            <div style={{ width: "100%" }}>
              <div className="aiTitle">{s.title}</div>
              <div className="aiDesc">{s.desc}</div>

              <div className="scoreRow">
                <div className="scoreBar">
                  <div className="scoreFill" style={{ width: `${Math.round((s.score || 0) * 100)}%` }} />
                </div>
                <div className="scoreNum">{Math.round((s.score || 0) * 100)}%</div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btnPrimary" type="button" onClick={() => apply(s)}>
                  Apply to order
                </button>
                <button className="linkBtn" type="button" onClick={() => alert("Demo: hiển thị lý do/luật kết hợp")}>
                  Vì sao?
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hr" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900 }}>Đơn đang chọn (mock)</div>
          <div style={{ color: "var(--muted2)", fontSize: 12 }}>Danh sách SKU được “Apply” từ AI</div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {draftItems.length === 0 ? (
            <span style={{ color: "var(--muted2)" }}>Chưa có SKU nào</span>
          ) : (
            draftItems.map((sku) => (
              <span key={sku} className="chip on" style={{ cursor: "default" }}>{sku}</span>
            ))
          )}
          {draftItems.length > 0 ? (
            <button className="btnGhost" type="button" onClick={() => setDraftItems([])}>
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
