import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import "../styles/pages.css";
import api, { formatVND, reportAPI } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import RevenueChart from "../components/RevenueChart";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [range, setRange] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
    7: t("revenue.range_7_full"),
    30: t("revenue.range_30_full"),
    90: t("revenue.range_90_full")
  }[range] || t("revenue.range_7_full");

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">{t("revenue.title")}</div>
          <div className="cardSub">{t("revenue.subtitle")}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btnGhost"
            type="button"
            onClick={async () => {
              try {
                await reportAPI.exportRevenue(range);
                showToast(t("revenue.msg_export_success"));
              } catch (e) {
                showToast(t("revenue.msg_export_error") + e.message, "error");
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("revenue.btn_export")}
          </button>
          <select
            className="miniSelect"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
          >
            <option value={7}>{t("revenue.range_7")}</option>
            <option value={30}>{t("revenue.range_30")}</option>
            <option value={90}>{t("revenue.range_90")}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>{t("common.loading")}</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Stat label={t("revenue.stat_total")} value={formatVND(stats.total)} sub={`AOV: ${formatVND(stats.aov)}`} />
            <Stat label={t("revenue.stat_completed")} value={stats.completed} sub={t("status.delivered")} />
            <Stat label={t("revenue.stat_shipping")} value={stats.shipping} sub={t("status.shipping")} />
            <Stat label={t("revenue.stat_pending")} value={stats.pending} sub={t("status.pending")} />
          </div>

          <div className="card chartCard" style={{ marginTop: 12 }}>
            <div className="chartHeader">
              <h3>{t("revenue.chart_title")}</h3>
              <span className="muted">{rangeLabel}</span>
            </div>
            <RevenueChart key={`rev-${range}`} data={chartData} />
          </div>

          <div className="hr" />

          <div className="cardTitle" style={{ fontSize: 14 }}>{t("revenue.top_products")}</div>
          <div className="table" style={{ marginTop: 10 }}>
            <div className="tr th">
              <div>{t("revenue.col_id")}</div>
              <div>{t("revenue.col_name")}</div>
              <div>{t("revenue.col_qty")}</div>
              <div>{t("revenue.col_revenue")}</div>
            </div>

            {topProducts.map((p) => (
              <div className="tr" key={p.id}>
                <div className="mono">#{p.id}</div>
                <div style={{ fontWeight: 800 }}>{p.name}</div>
                <div className="mono">{p.qty}</div>
                <div className="mono" style={{ fontWeight: '700' }}>{formatVND(p.revenue)}</div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                {t("revenue.empty_products")}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
