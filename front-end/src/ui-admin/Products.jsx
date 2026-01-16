import { useEffect, useMemo, useState } from "react";
import { productAPI, formatVND } from "../js/api.js";
import "../css/dashboard.css";

const PLACEHOLDER_IMG = "https://placehold.co/400x400/f5f5f5/999?text=No+Image";

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

function ImageGalleryModal({ open, product, onClose, onSave }) {
  const [primaryId, setPrimaryId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      // images[0] = primary, images[1] = hover (theo cách shop hoạt động)
      const sorted = [...product.images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setPrimaryId(sorted[0]?.id || null);
      setHoverId(sorted[1]?.id || null);
    } else {
      setPrimaryId(null);
      setHoverId(null);
    }
  }, [product]);

  if (!open || !product) return null;

  const images = product.images || [];

  const handleSave = async () => {
    if (!primaryId) {
      alert("Vui lòng chọn ảnh đại diện");
      return;
    }
    setSaving(true);
    try {
      await onSave(product.id, primaryId, hoverId);
      onClose();
    } catch (err) {
      alert("Lỗi khi lưu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const primaryImg = images.find(img => img.id === primaryId);
  const hoverImg = images.find(img => img.id === hoverId);

  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal imageGalleryModal" onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: 800 }}>
        <div className="modalHead">
          <div className="modalTitle">Quản lý ảnh - {product.name}</div>
          <button className="iconBtn" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="modalBody">
          {images.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Sản phẩm này chưa có ảnh</p>
          ) : (
            <>
              {/* Preview section */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 24, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: 8, fontWeight: 500, color: '#333' }}>Ảnh đại diện</p>
                  <div style={{ 
                    width: 150, height: 150, border: '2px solid #000', borderRadius: 8,
                    backgroundImage: primaryImg ? `url(${primaryImg.imageUrl})` : 'none',
                    backgroundColor: '#f5f5f5',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: 8, fontWeight: 500, color: '#333' }}>Ảnh hover</p>
                  <div style={{ 
                    width: 150, height: 150, border: '2px dashed #999', borderRadius: 8,
                    backgroundImage: hoverImg ? `url(${hoverImg.imageUrl})` : 'none',
                    backgroundColor: '#f5f5f5',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }} />
                </div>
              </div>

              {/* Image selection grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                gap: 12,
                maxHeight: 300,
                overflowY: 'auto',
                padding: 4
              }}>
                {images.map((img) => {
                  const isPrimary = img.id === primaryId;
                  const isHover = img.id === hoverId;
                  return (
                    <div 
                      key={img.id} 
                      style={{ 
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: isPrimary ? '3px solid #000' : isHover ? '3px solid #666' : '2px solid #ddd',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img 
                        src={img.imageUrl} 
                        alt={img.altText || 'Product image'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Badges */}
                      <div style={{ position: 'absolute', top: 4, left: 4, display: 'flex', gap: 4 }}>
                        {isPrimary && (
                          <span style={{ 
                            background: '#000', color: '#fff', fontSize: 10, padding: '2px 6px', 
                            borderRadius: 4, fontWeight: 600 
                          }}>ĐẠI DIỆN</span>
                        )}
                        {isHover && (
                          <span style={{ 
                            background: '#666', color: '#fff', fontSize: 10, padding: '2px 6px', 
                            borderRadius: 4, fontWeight: 600 
                          }}>HOVER</span>
                        )}
                      </div>
                      {/* Action buttons */}
                      <div style={{ 
                        position: 'absolute', bottom: 0, left: 0, right: 0, 
                        display: 'flex', background: 'rgba(0,0,0,0.7)'
                      }}>
                        <button
                          type="button"
                          onClick={() => setPrimaryId(img.id)}
                          style={{ 
                            flex: 1, padding: '6px 4px', border: 'none', 
                            background: isPrimary ? '#000' : 'transparent',
                            color: '#fff', fontSize: 11, cursor: 'pointer'
                          }}
                        >
                          Đại diện
                        </button>
                        <button
                          type="button"
                          onClick={() => setHoverId(img.id === hoverId ? null : img.id)}
                          style={{ 
                            flex: 1, padding: '6px 4px', border: 'none', 
                            borderLeft: '1px solid rgba(255,255,255,0.2)',
                            background: isHover ? '#666' : 'transparent',
                            color: '#fff', fontSize: 11, cursor: 'pointer'
                          }}
                        >
                          Hover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="modalActions">
          <button className="btnGhost" type="button" onClick={onClose}>Hủy</button>
          <button className="btnPrimary" type="button" onClick={handleSave} disabled={saving || images.length === 0}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState(null);

  const editing = useMemo(
    () => products.find((p) => p.id === editingId) || null,
    [products, editingId]
  );

  const [form, setForm] = useState({ sku: "", name: "", category: "", price: "", stock: "" });

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ sku: "", name: "", category: "", price: "", stock: "" });
    setEditOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      sku: p.sku || "",
      name: p.name || "",
      category: p.category || "",
      price: String(p.salePrice || p.basePrice || 0),
      stock: String(p.totalStock || 0),
    });
    setEditOpen(true);
  };

  const openGallery = (p) => {
    setGalleryProduct(p);
    setGalleryOpen(true);
  };

  const handleSaveImages = async (productId, primaryId, hoverId) => {
    // Gọi API để set primary image
    // Shop sử dụng images[0] = primary, images[1] = hover
    // Nên ta cần set sortOrder cho các ảnh
    await productAPI.setPrimaryImage(productId, primaryId);
    // Reload products để cập nhật UI
    await loadProducts();
  };

  const save = () => {
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim() || "Other",
      basePrice: Number(form.price || 0),
    };
    if (!payload.sku || !payload.name) {
      alert("Vui lòng nhập SKU và tên sản phẩm.");
      return;
    }
    // TODO: Call API to save
    alert("Chức năng lưu đang được phát triển");
    setEditOpen(false);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const text = `${p.sku || ''} ${p.name || ''} ${p.category || ''}`.toLowerCase();
      return !q || text.includes(q.toLowerCase());
    });
  }, [products, q]);

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      // Sort by sortOrder and get first image
      const sorted = [...product.images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return sorted[0].imageUrl;
    }
    if (product.thumbnail) return product.thumbnail;
    return PLACEHOLDER_IMG;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="cardHead">
          <div className="cardTitle">Sản phẩm</div>
        </div>
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">Sản phẩm</div>
          <div className="cardSub">{products.length} sản phẩm • Click vào ảnh để quản lý gallery</div>
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
          const b = stockBadge(p.totalStock || 0);
          const imgUrl = getProductImage(p);
          return (
            <div className="pCard" key={p.id}>
              <div 
                className="pThumb" 
                style={{ 
                  backgroundImage: `url(${imgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => openGallery(p)}
                title="Click để quản lý ảnh"
              >
                {p.images && p.images.length > 1 && (
                  <span style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                    padding: '2px 8px', borderRadius: 4, fontSize: 12
                  }}>
                    +{p.images.length - 1} ảnh
                  </span>
                )}
              </div>
              <div className="pTop">
                <div>
                  <div className="pName">{p.name}</div>
                  <div className="pMeta">{p.category} • <span className="mono">{p.sku}</span></div>
                </div>
                <span className={`badgeStock ${b.cls}`}>{b.label}</span>
              </div>

              <div className="pBottom">
                <div className="pPrice">{formatVND(p.salePrice || p.basePrice || 0)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="linkBtn" type="button" onClick={() => openEdit(p)}>Sửa</button>
                  <button className="linkBtn" type="button" onClick={() => openGallery(p)}>Ảnh</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} title={editing ? `Sửa sản phẩm • ${editing.sku}` : "Thêm sản phẩm"} onClose={() => setEditOpen(false)}>
        <div className="formGrid">
          <label className="field">
            <span>SKU</span>
            <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="VD: FYD-TS-NEW" />
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
        </div>

        <div className="modalActions">
          <button className="btnGhost" type="button" onClick={() => setEditOpen(false)}>Hủy</button>
          <button className="btnPrimary" type="button" onClick={save}>Lưu</button>
        </div>
      </Modal>

      {/* Image Gallery Modal */}
      <ImageGalleryModal 
        open={galleryOpen} 
        product={galleryProduct} 
        onClose={() => setGalleryOpen(false)}
        onSave={handleSaveImages}
      />
    </div>
  );
}
