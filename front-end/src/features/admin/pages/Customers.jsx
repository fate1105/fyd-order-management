import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import "../styles/pages.css";
import api, { formatVND } from "@shared/utils/api.js";
import { useTranslation } from "react-i18next";

export default function Customers() {
  const { t } = useTranslation();
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
          <div className="cardTitle">{t("customers.title")}</div>
          <div className="cardSub">{t("customers.subtitle")}</div>
        </div>

        <input
          className="miniInput"
          placeholder={t("customers.search_placeholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        <button className="chip on" type="button">
          {t("customers.tab_all")} ({tierCounts.all})
        </button>
        {Object.entries(tierCounts).filter(([k]) => k !== 'all' && tierCounts[k] > 0).map(([k, v]) => (
          <button key={k} className="chip" type="button">{k} ({v})</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>{t("common.loading")}</div>
      ) : (
        <div className="table">
          <div className="tr th">
            <div>{t("customers.col_name")}</div>
            <div>{t("customers.col_phone")}</div>
            <div>{t("customers.col_tier")}</div>
            <div>{t("customers.col_orders")}</div>
            <div>{t("customers.col_spent")}</div>
          </div>

          {customers.map((c) => (
            <div className="tr" key={c.id}>
              <div className="cellFlex">
                <div className="miniAvatar">{(c.fullName || "?").slice(0, 1).toUpperCase()}</div>
                <div className="nameStack">
                  <div className="nameMain">{c.fullName}</div>
                  <div className="nameSub">{c.email || t("customers.no_email")}</div>
                </div>
              </div>

              <div className="mono" style={{ fontWeight: '500' }}>{c.phone}</div>
              <div>
                <span className={`pill ${c.tier === "VIP" ? "ship" : c.tier === "Gold" ? "ok" : "pending"}`}>
                  {c.tier || t("customers.member")}
                </span>
              </div>
              <div className="mono" style={{ textAlign: 'center' }}>{c.totalOrders || 0}</div>
              <div className="mono" style={{ fontWeight: '700' }}>{formatVND(c.totalSpent || 0)}</div>
            </div>
          ))}
          {customers.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              {t("customers.empty")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
