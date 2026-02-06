import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import "../styles/pages.css";
import api, { formatVND, reportAPI } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import { useTranslation } from "react-i18next";

function LevelTag({ stock }) {
  const { t } = useTranslation();
  if (stock <= 0) return <span className="badgeStock out">{t("products.stock_out").toUpperCase()} • {stock}</span>;
  if (stock <= 6) return <span className="badgeStock low">{t("products.stock_low").toUpperCase()} • {stock}</span>;
  return <span className="badgeStock">{t("inventory.status_ok").toUpperCase()} • {stock}</span>;
}

export default function Inventory() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [sort, setSort] = useState("stockAsc");
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [summary, setSummary] = useState({ low: 0, out: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [catRes, sizeRes] = await Promise.all([
          api.category.getFlat(),
          api.size.getAll()
        ]);
        setCategories(catRes || []);
        setSizes(sizeRes || []);
      } catch (err) {
        console.error("Failed to load filter data:", err);
      }
    }
    loadInitialData();
  }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await api.inventory.getAll({
        q,
        filter,
        categoryId: categoryId || undefined,
        sizeId: sizeId || undefined,
        sort
      });
      setItems(res.items || []);
      setSummary({
        low: res.lowCount || 0,
        out: res.outCount || 0,
        total: res.total || 0
      });
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, [q, filter, categoryId, sizeId, sort]);

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.stock.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async (itemId) => {
    const newStock = parseInt(editValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      showToast(t("inventory.invalid_qty"), "error");
      return;
    }

    setSaving(true);
    try {
      await api.inventory.setVariantStock(itemId, newStock);
      // Update local state
      setItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, stock: newStock, stockStatus: newStock <= 0 ? "out" : (newStock <= 6 ? "low" : "ok") }
          : item
      ));
      // Refresh summary counts
      loadInventory();
      setEditingId(null);
      setEditValue("");
      showToast(t("inventory.update_success"));
    } catch (error) {
      console.error("Failed to update stock:", error);
      showToast(t("inventory.update_error"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e, itemId) => {
    if (e.key === "Enter") {
      handleSaveEdit(itemId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="card">
      <div className="cardHead" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 15 }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="cardTitle">{t("common.inventory")}</div>
            <div className="cardSub">{t("inventory.subtitle")}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btnGhost"
              type="button"
              onClick={async () => {
                try {
                  await reportAPI.exportInventory(filter === 'low' || filter === 'out');
                  showToast(t("orders.export_success"));
                } catch (e) {
                  showToast(t("orders.export_error") + e.message, "error");
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("orders.export_excel")}
            </button>
            <div className="statusGroup">
              <span className="badgeStock">{t("inventory.total", { count: summary.total })}</span>
              <span className="badgeStock low">{t("inventory.low", { count: summary.low })}</span>
              <span className="badgeStock out">{t("inventory.out", { count: summary.out })}</span>
            </div>
          </div>
        </div>

        <div className="filterBarInventory" style={{ display: "flex", gap: 10, width: '100%', flexWrap: "wrap" }}>
          <input
            className="miniInput"
            style={{ flex: 2, minWidth: '200px' }}
            placeholder={t("inventory.search_placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select className="miniSelect" style={{ flex: 1 }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">{t("inventory.all_cats")}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select className="miniSelect" style={{ flex: 1 }} value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
            <option value="">{t("inventory.all_sizes")}</option>
            {sizes.map(s => (
              <option key={s.id} value={s.id}>{t("products.size")}: {s.name}</option>
            ))}
          </select>

          <select className="miniSelect" style={{ flex: 1 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t("inventory.all_status")}</option>
            <option value="low">{t("inventory.low_alert")}</option>
            <option value="out">{t("inventory.out_alert")}</option>
          </select>

          <select className="miniSelect" style={{ flex: 1 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="stockAsc">{t("inventory.sort_low")}</option>
            <option value="stockDesc">{t("inventory.sort_high")}</option>
            <option value="priceAsc">{t("inventory.sort_price_low")}</option>
            <option value="priceDesc">{t("inventory.sort_price_high")}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>{t("common.loading")}</div>
      ) : (
        <div className="table">
          <div className="tr th">
            <div>{t("inventory.col_sku")}</div>
            <div>{t("inventory.col_product")}</div>
            <div>{t("inventory.col_cat")}</div>
            <div>{t("inventory.col_price")}</div>
            <div>{t("inventory.col_stock")}</div>
          </div>

          {items.map((p) => {
            // Example name from backend: "Giày Sneaker - 38 / Black"
            const nameParts = p.name.split(" - ");
            const productName = nameParts[0];
            const variantInfo = nameParts[1] || "";
            const isEditing = editingId === p.id;

            return (
              <div className={`tr ${p.stockStatus}`} key={p.id}>
                <div className="mono" style={{ fontSize: '11px', opacity: 0.8 }}>{p.sku}</div>
                <div>
                  <div style={{ fontWeight: 850 }}>{productName}</div>
                  {variantInfo && (
                    <div style={{ fontSize: '12px', color: 'var(--admin-accent)', fontWeight: '600', marginTop: '2px' }}>
                      {variantInfo}
                    </div>
                  )}
                </div>
                <div style={{ color: "var(--muted2)", fontSize: '13px' }}>{p.category}</div>
                <div className="mono">{formatVND(p.price)}</div>
                <div>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="number"
                        className="miniInput"
                        style={{
                          width: '70px',
                          padding: '6px 8px',
                          fontSize: '13px',
                          textAlign: 'center',
                          fontWeight: '700'
                        }}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, p.id)}
                        autoFocus
                        min="0"
                        disabled={saving}
                      />
                      <button
                        className="btnMini btnPrimary"
                        onClick={() => handleSaveEdit(p.id)}
                        disabled={saving}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        {saving ? '...' : '✓'}
                      </button>
                      <button
                        className="btnMini btnGhost"
                        onClick={handleCancelEdit}
                        disabled={saving}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`badgeStock ${p.stockStatus}`}
                      onClick={() => handleStartEdit(p)}
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      title={t("inventory.edit_tip")}
                    >
                      <LevelTag stock={p.stock} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

