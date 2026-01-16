import { useMemo, useState } from "react";
import { formatVND, productsSeed } from "../js/mock.js";
import "../css/dashboard.css";

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

function stockBadge(stock) {
  if (stock <= 0) return { cls: "out", label: "Hết hàng" };
  if (stock <= 6) return { cls: "low", label: "Sắp hết" };
  return { cls: "", label: `Tồn: ${stock}` };
}

export default function Products() {
  const [products, setProducts] = useState(productsSeed);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const editing = useMemo(
    () => products.find((p) => p.id === editingId) || null,
    [products, editingId]
  );

  const [form, setForm] = useState({ id: "", name: "", category: "", price: "", stock: "" });

  const openAdd = () => {
    setEditingId(null);
    setForm({ id: "", name: "", category: "", price: "", stock: "" });
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
    });
    setOpen(true);
  };

  const save = () => {
    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category.trim() || "Other",
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
    };
    if (!payload.id || !payload.name) {
      alert("Vui lòng nhập SKU và tên sản phẩm.");
      return;
    }

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === payload.id);
      if (editingId) {
        return prev.map((p) => (p.id === editingId ? payload : p));
      }
      if (exists) {
        alert("SKU đã tồn tại. Hãy dùng SKU khác hoặc sửa sản phẩm.");
        return prev;
      }
      return [payload, ...prev];
    });

    setOpen(false);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const text = `${p.id} ${p.name} ${p.category}`.toLowerCase();
      return !q || text.includes(q.toLowerCase());
    });
  }, [products, q]);

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Sản phẩm</div>
          <div className="cardSub">Card grid • Add/Edit modal • Cảnh báo tồn kho (mock)</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input
            className="miniInput"
            placeholder="Tìm SKU/tên/category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btnPrimary" type="button" onClick={openAdd}>+ Thêm sản phẩm</button>
        </div>
      </div>

      <div className="gridCards">
        {filtered.map((p) => {
          const b = stockBadge(p.stock);
          return (
            <div className="pCard" key={p.id}>
              <div className="pThumb" aria-hidden="true" />
              <div className="pTop">
                <div>
                  <div className="pName">{p.name}</div>
                  <div className="pMeta">{p.category} • <span className="mono">{p.id}</span></div>
                </div>
                <span className={`badgeStock ${b.cls}`}>{b.label}</span>
              </div>

              <div className="pBottom">
                <div className="pPrice">{formatVND(p.price)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="linkBtn" type="button" onClick={() => openEdit(p)}>Sửa</button>
                  <button
                    className="linkBtn"
                    type="button"
                    onClick={() => setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, stock: Math.max(0, x.stock - 1) } : x))}
                  >
                    -1 tồn
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} title={editing ? `Sửa sản phẩm • ${editing.id}` : "Thêm sản phẩm"} onClose={() => setOpen(false)}>
        <div className="formGrid">
          <label className="field">
            <span>SKU</span>
            <input value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} placeholder="VD: FYD-TS-NEW" />
          </label>
          <label className="field">
            <span>Danh mục</span>
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="VD: T-shirt" />
          </label>
          <label className="field">
            <span>Tên sản phẩm</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="VD: Áo thun FYD Premium" />
          </label>
          <label className="field">
            <span>Giá (VND)</span>
            <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="220000" />
          </label>
          <label className="field">
            <span>Tồn kho</span>
            <input value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="10" />
          </label>
        </div>

        <div className="modalActions">
          <button className="btnGhost" type="button" onClick={() => setOpen(false)}>Hủy</button>
          <button className="btnPrimary" type="button" onClick={save}>Lưu (mock)</button>
        </div>
      </Modal>
    </div>
  );
}
