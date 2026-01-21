import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import "../styles/pages.css";
import api, { formatVND } from "@shared/utils/api.js";

function level(stock) {
  if (stock <= 0) return { tag: "Hết hàng", cls: "out" };
  if (stock <= 6) return { tag: "Sắp hết", cls: "low" };
  return { tag: "Ổn", cls: "" };
}

export default function Inventory() {
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
      alert("Số lượng không hợp lệ");
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
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Lỗi khi cập nhật số lượng");
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
            <div className="cardTitle">Tồn kho</div>
            <div className="cardSub">Quản lý chi tiết theo biến thể (Size/Màu) — Click vào số lượng để chỉnh sửa</div>
          </div>
          <div className="statusGroup">
            <span className="badgeStock">TỔNG: {summary.total}</span>
            <span className="badgeStock low">SẮP HẾT: {summary.low}</span>
            <span className="badgeStock out">HẾT HÀNG: {summary.out}</span>
          </div>
        </div>

        <div className="filterBarInventory" style={{ display: "flex", gap: 10, width: '100%', flexWrap: "wrap" }}>
          <input
            className="miniInput"
            style={{ flex: 2, minWidth: '200px' }}
            placeholder="Tìm SKU, tên sản phẩm..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select className="miniSelect" style={{ flex: 1 }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select className="miniSelect" style={{ flex: 1 }} value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
            <option value="">Tất cả kích thước</option>
            {sizes.map(s => (
              <option key={s.id} value={s.id}>Size: {s.name}</option>
            ))}
          </select>

          <select className="miniSelect" style={{ flex: 1 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="low">Cảnh báo: Sắp hết</option>
            <option value="out">Cảnh báo: Hết hàng</option>
          </select>

          <select className="miniSelect" style={{ flex: 1 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="stockAsc">Tồn kho: Thấp - Cao</option>
            <option value="stockDesc">Tồn kho: Cao - Thấp</option>
            <option value="priceAsc">Giá: Thấp - Cao</option>
            <option value="priceDesc">Giá: Cao - Thấp</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontWeight: '800' }}>ĐANG TẢI...</div>
      ) : (
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
            // Example name from backend: "Giày Sneaker - 38 / Black"
            const nameParts = p.name.split(" - ");
            const productName = nameParts[0];
            const variantInfo = nameParts[1] || "";
            const isEditing = editingId === p.id;

            return (
              <div className={`tr ${lv.cls}`} key={p.id}>
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
                      className={`badgeStock ${lv.cls}`}
                      onClick={() => handleStartEdit(p)}
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      title="Click để chỉnh sửa số lượng"
                    >
                      {lv.tag.toUpperCase()} • {p.stock}
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

