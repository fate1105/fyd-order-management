import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { productAPI, categoryAPI, formatVND, aiAPI, brandAPI, colorAPI, sizeAPI } from "@shared/utils/api.js";
import "../styles/dashboard.css";
import "../styles/pages.css";

const PLACEHOLDER_IMG = "https://placehold.co/400x400/f5f5f5/999?text=No+Image";

// SVG Icons
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  // Use portal to render modal to document.body, bypassing any parent transforms
  return createPortal(
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">{title}</div>
          <button className="iconBtn" type="button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>,
    document.body
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

  // Use portal to render modal to document.body, bypassing any parent transforms
  return createPortal(
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal imageGalleryModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">Quản lý ảnh - {product.name}</div>
          <button className="iconBtn" type="button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
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
                            background: 'var(--admin-accent)', color: '#0a0a0f', fontSize: 9, padding: '2px 6px',
                            borderRadius: 4, fontWeight: 700
                          }}>ĐẠI DIỆN</span>
                        )}
                        {isHover && (
                          <span style={{
                            background: '#666', color: '#fff', fontSize: 9, padding: '2px 6px',
                            borderRadius: 4, fontWeight: 700
                          }}>HOVER</span>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        className="iconBtn"
                        style={{
                          position: 'absolute', top: 4, right: 4,
                          background: 'rgba(255, 0, 0, 0.7)',
                          width: 20, height: 20, padding: 0,
                          borderRadius: 4, border: 'none', color: '#fff'
                        }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm("Xóa ảnh này?")) return;
                          try {
                            await productAPI.deleteImage(product.id, img.id);
                            await loadProducts();
                          } catch (err) {
                            alert("Lỗi khi xóa: " + err.message);
                          }
                        }}
                      >
                        <CloseIcon />
                      </button>

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
    </div>,
    document.body
  );
}

function stockBadge(stock) {
  if (stock <= 0) return { cls: "out", label: "Hết hàng" };
  if (stock <= 6) return { cls: "low", label: "Sắp hết" };
  return { cls: "", label: `Tồn: ${stock}` };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const [form, setForm] = useState({
    sku: "",
    name: "",
    categoryId: "",
    brandId: "",
    basePrice: "",
    salePrice: "",
    costPrice: "",
    description: "",
    shortDescription: "",
    material: "",
    initialStock: "",
    initialSizeId: "",
    initialColorId: "",
    isFeatured: false,
    isNew: false,
    status: "ACTIVE"
  });
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [aiLoading, setAiLoading] = useState({ description: false, category: false, shortDesc: false });

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prodData, catData, brandData, colorData, sizeData] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getFlat().catch(() => []),
        brandAPI.getAll().catch(() => []),
        colorAPI.getAll().catch(() => []),
        sizeAPI.getAll().catch(() => [])
      ]);
      setProducts(prodData.products || []);
      setCategories(catData || []);
      setBrands(brandData || []);
      setColors(colorData || []);
      setSizes(sizeData || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      sku: "",
      name: "",
      categoryId: "",
      brandId: "",
      basePrice: "",
      salePrice: "",
      costPrice: "",
      description: "",
      shortDescription: "",
      material: "",
      initialStock: "",
      initialSizeId: "",
      initialColorId: "",
      isFeatured: false,
      isNew: false,
      status: "ACTIVE"
    });
    setEditOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      sku: p.sku || "",
      name: p.name || "",
      categoryId: p.categoryId || (p.category?.id ? String(p.category.id) : ""),
      brandId: p.brandId || (p.brand?.id ? String(p.brand.id) : ""),
      basePrice: String(p.basePrice || 0),
      salePrice: p.salePrice ? String(p.salePrice) : "",
      costPrice: p.costPrice ? String(p.costPrice) : "",
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      material: p.material || "",
      initialStock: String(p.totalStock || 0),
      initialSizeId: "",
      initialColorId: "",
      isFeatured: p.isFeatured || false,
      isNew: p.isNew || false,
      status: p.status || "ACTIVE"
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

  const save = async () => {
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      brandId: form.brandId ? Number(form.brandId) : null,
      basePrice: Number(form.basePrice || 0),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      costPrice: form.costPrice ? Number(form.costPrice) : null,
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      material: form.material.trim(),
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      status: form.status,
      initialStock: form.initialStock ? Number(form.initialStock) : 0,
      initialSizeId: form.initialSizeId ? Number(form.initialSizeId) : null,
      initialColorId: form.initialColorId ? Number(form.initialColorId) : null
    };

    if (!payload.sku || !payload.name || !payload.basePrice) {
      alert("Vui lòng nhập SKU, tên và giá sản phẩm.");
      return;
    }

    try {
      if (editingId) {
        await productAPI.update(editingId, payload);
      } else {
        await productAPI.create(payload);
      }
      await loadProducts();
      setEditOpen(false);
    } catch (err) {
      alert("Lỗi: " + (err.message || "Không thể lưu sản phẩm"));
    }
  };

  // Get unique categories from products
  const uniqueCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      // Search filter
      const text = `${p.sku || ''} ${p.name || ''} ${p.category || ''}`.toLowerCase();
      return !q || text.includes(q.toLowerCase());
    });
  }, [products, q, selectedCategory]);

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

      {/* Category Filter Tabs */}
      <div className="categoryTabs">
        <button
          className={`categoryTab ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
          type="button"
        >
          Tất cả<span className="count">{categoryCounts.all || 0}</span>
        </button>
        {uniqueCategories.map(cat => (
          <button
            key={cat}
            className={`categoryTab ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
            type="button"
          >
            {cat}<span className="count">{categoryCounts[cat] || 0}</span>
          </button>
        ))}
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
                  <div className="pMeta">{p.brand || 'FYD'} • {p.category} • <span className="mono">{p.sku}</span></div>
                </div>
                <span className={`badgeStock ${b.cls}`}>{b.label}</span>
              </div>

              <div className="pBottom">
                <div className="pPrice">{formatVND(p.salePrice || p.basePrice || 0)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="linkBtn" type="button" onClick={() => openEdit(p)}>Sửa</button>
                  <button className="linkBtn" type="button" onClick={() => openGallery(p)}>Ảnh</button>
                  <button
                    className="linkBtn"
                    type="button"
                    style={{ color: '#ff6b6b' }}
                    onClick={async () => {
                      if (!window.confirm(`Bạn chắc chắn muốn xóa sản phẩm "${p.name}"?`)) return;
                      try {
                        await productAPI.delete(p.id);
                        await loadProducts();
                      } catch (err) {
                        alert('Lỗi khi xóa: ' + err.message);
                      }
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} title={editing ? `Sửa sản phẩm • ${editing.sku}` : "Thêm sản phẩm mới"} onClose={() => setEditOpen(false)}>
        <div className="product-form">
          {/* Basic Info */}
          <div className="form-section-title">Thông tin cơ bản</div>
          <div className="formGrid">
            <label className="field">
              <span>SKU *</span>
              <input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                placeholder="VD: FYD-TS-001"
              />
            </label>
            <label className="field">
              <span>Tên sản phẩm *</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="VD: Áo thun FYD Premium"
              />
            </label>
            <label className="field">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Danh mục</span>
                <button
                  type="button"
                  style={{ fontSize: 10, background: 'none', border: 'none', color: 'var(--admin-accent)', cursor: 'pointer', padding: 0 }}
                  disabled={!form.name || aiLoading.category}
                  onClick={async () => {
                    setAiLoading(prev => ({ ...prev, category: true }));
                    try {
                      const res = await aiAPI.suggestCategory(form.name);
                      if (res.success && res.category) {
                        const target = categories.find(c => c.name.toLowerCase().includes(res.category.toLowerCase()));
                        if (target) setForm(f => ({ ...f, categoryId: String(target.id) }));
                        else alert(`AI gợi ý: ${res.category} (Không tìm thấy danh mục tương ứng)`);
                      }
                    } finally {
                      setAiLoading(prev => ({ ...prev, category: false }));
                    }
                  }}
                >
                  {aiLoading.category ? "..." : "AI Gợi ý"}
                </button>
              </div>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="form-select"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Thương hiệu</span>
              <select
                value={form.brandId}
                onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                className="form-select"
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Pricing & Initial Stock */}
          <div className="form-section-title" style={{ marginTop: 20 }}>Giá cả & Kho hàng ban đầu</div>
          <div className="formGrid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <label className="field">
              <span>Giá gốc * (VND)</span>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                placeholder="299000"
              />
            </label>
            <label className="field">
              <span>Giá khuyến mãi</span>
              <input
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                placeholder="249000"
              />
            </label>
            <label className="field">
              <span>Giá vốn</span>
              <input
                type="number"
                value={form.costPrice}
                onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                placeholder="150000"
              />
            </label>
            <label className="field">
              <span>{editing ? "Tổng tồn kho hiện tại" : "Số lượng nhập kho *"}</span>
              <input
                type="number"
                value={form.initialStock}
                onChange={(e) => setForm((f) => ({ ...f, initialStock: e.target.value }))}
                placeholder="100"
                disabled={!!editing}
              />
            </label>

            {!editing && (
              <>
                <label className="field">
                  <span>Kích thước (Size)</span>
                  <select
                    className="form-select"
                    value={form.initialSizeId}
                    onChange={(e) => setForm(f => ({ ...f, initialSizeId: e.target.value }))}
                  >
                    <option value="">-- Mặc định (F) --</option>
                    {sizes.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Màu sắc (Color)</span>
                  <select
                    className="form-select"
                    value={form.initialColorId}
                    onChange={(e) => setForm(f => ({ ...f, initialColorId: e.target.value }))}
                  >
                    <option value="">-- Mặc định --</option>
                    {colors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <div className="form-section-title" style={{ margin: 0 }}>Mô tả</div>
            <button
              type="button"
              className="btnGhost"
              style={{ fontSize: 11, padding: '4px 12px' }}
              disabled={!form.name || aiLoading.description}
              onClick={async () => {
                if (!form.name) return;
                setAiLoading(prev => ({ ...prev, description: true }));
                try {
                  const categoryName = categories.find(c => String(c.id) === form.categoryId)?.name || '';
                  const res = await aiAPI.generateDescription(form.name, categoryName);
                  if (res.success && res.generatedDescription) {
                    setForm(f => ({ ...f, description: res.generatedDescription }));
                  }
                } catch (err) {
                  console.error('AI description generation failed:', err);
                } finally {
                  setAiLoading(prev => ({ ...prev, description: false }));
                }
              }}
            >
              {aiLoading.description ? 'Đang tạo...' : 'AI Sinh mô tả'}
            </button>
          </div>
          <div className="formGrid" style={{ marginTop: 12 }}>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Mô tả ngắn</span>
                <button
                  type="button"
                  style={{ fontSize: 10, background: 'none', border: 'none', color: 'var(--admin-accent)', cursor: 'pointer', padding: 0 }}
                  disabled={!form.name || aiLoading.shortDesc}
                  onClick={async () => {
                    setAiLoading(prev => ({ ...prev, shortDesc: true }));
                    try {
                      const res = await aiAPI.generateShortDescription(form.name);
                      if (res.success && res.shortDescription) {
                        setForm(f => ({ ...f, shortDescription: res.shortDescription }));
                      }
                    } finally {
                      setAiLoading(prev => ({ ...prev, shortDesc: false }));
                    }
                  }}
                >
                  {aiLoading.shortDesc ? "..." : "AI Gợi ý"}
                </button>
              </div>
              <input
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                placeholder="Mô tả ngắn gọn về sản phẩm..."
              />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Mô tả chi tiết</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả chi tiết về sản phẩm, chất liệu, kiểu dáng..."
                rows={3}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--admin-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--admin-text)'
                }}
              />
            </label>
          </div>

          {/* Additional Info */}
          <div className="form-section-title" style={{ marginTop: 20 }}>Thông tin bổ sung</div>
          <div className="formGrid">
            <label className="field">
              <span>Chất liệu</span>
              <input
                value={form.material}
                onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                placeholder="VD: Cotton 100%"
              />
            </label>
            <label className="field">
              <span>Trạng thái</span>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="form-select"
              >
                <option value="ACTIVE">Đang bán</option>
                <option value="INACTIVE">Ngừng bán</option>
                <option value="DRAFT">Nháp</option>
              </select>
            </label>
          </div>

          {/* Image Upload Section - Only show when editing existing product */}
          {editing && (
            <>
              <div className="form-section-title" style={{ marginTop: 20 }}>Hình ảnh sản phẩm</div>
              <div className="image-upload-section">
                <div className="current-images">
                  {editing.images && editing.images.length > 0 ? (
                    editing.images.map((img, idx) => (
                      <div key={img.id || idx} className="image-preview-item">
                        <img src={img.imageUrl} alt={`Product ${idx + 1}`} />
                        {img.isPrimary && <span className="primary-badge">Chính</span>}
                        <button
                          type="button"
                          className="delete-img-btn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm("Xóa ảnh này?")) return;
                            try {
                              await productAPI.deleteImage(editing.id, img.id);
                              await loadProducts();
                            } catch (err) {
                              alert("Lỗi khi xóa: " + err.message);
                            }
                          }}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-images-text">Chưa có hình ảnh. Thêm ảnh sau khi tạo sản phẩm.</div>
                  )}
                </div>
                <label className="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !editing) return;
                      try {
                        await productAPI.uploadImage(editing.id, file);
                        await loadProducts();
                        // Refresh editing product
                        const updated = await productAPI.getById(editing.id);
                        setEditingId(updated.id);
                      } catch (err) {
                        alert('Lỗi upload ảnh: ' + err.message);
                      }
                      e.target.value = '';
                    }}
                  />
                  + Thêm ảnh mới
                </label>
              </div>
              <p style={{ fontSize: 11, color: 'var(--admin-text-muted-2)', marginTop: 8 }}>
                Nhấn vào nút "Ảnh" bên bảng sản phẩm để quản lý ảnh chi tiết.
              </p>
            </>
          )}

          {!editing && (
            <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 16, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px dashed var(--admin-border)' }}>
              Bạn có thể thêm hình ảnh sau khi tạo sản phẩm bằng cách nhấn nút "Ảnh" trong bảng sản phẩm.
            </p>
          )}

          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--admin-text)' }}>Sản phẩm nổi bật</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--admin-text)' }}>Sản phẩm mới</span>
            </label>
          </div>
        </div>

        <div className="modalActions">
          <button className="btnGhost" type="button" onClick={() => setEditOpen(false)}>Hủy</button>
          <button className="btnPrimary" type="button" onClick={save}>
            {editing ? 'Cập nhật' : 'Thêm sản phẩm'}
          </button>
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
