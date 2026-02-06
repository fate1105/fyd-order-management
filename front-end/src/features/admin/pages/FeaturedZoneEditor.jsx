import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@shared/context/ToastContext";
import { useConfirm } from "@shared/context/ConfirmContext";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import "../styles/dashboard.css";
import "../styles/pages.css";
import { useFeaturedZone, useFeaturedZones } from "../hooks/useFeaturedZone";
import { formatVND } from "@shared/utils/api.js";
import ProductPicker from "../components/featured/ProductPicker";
import ThumbnailEditor from "../components/featured/ThumbnailEditor";
import { useTranslation } from "react-i18next";

// Sortable product item
function SortableProduct({ item, onRemove, onEditThumbnail }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="product-item">
      <div className="drag-handle" {...attributes} {...listeners}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="2" />
          <circle cx="15" cy="6" r="2" />
          <circle cx="9" cy="12" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="9" cy="18" r="2" />
          <circle cx="15" cy="18" r="2" />
        </svg>
      </div>
      <img
        src={item.customThumbnail || item.product?.image || '/placeholder.jpg'}
        alt={item.product?.name}
        onClick={() => onEditThumbnail(item)}
        className="product-thumb"
      />
      <div className="product-info">
        <div className="product-name">{item.product?.name}</div>
        <div className="product-price">{formatVND(item.product?.price || 0)}</div>
      </div>
      <button className="remove-btn" onClick={() => onRemove(item.id)}>×</button>
    </div>
  );
}

export default function FeaturedZoneEditor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    zone, loading: zoneLoading, saving, hasChanges,
    updateGridConfig, updateZoneInfo, reorderProducts,
    addProduct, removeProduct, setProducts, updateThumbnail, saveZone, deleteZone
  } = useFeaturedZone(id);
  const { zones, loading: zonesLoading } = useFeaturedZones();

  const POSITIONS = [
    { value: 'home_hero', label: t('featured.pos_home_hero') },
    { value: 'home_featured', label: t('featured.pos_home_featured') },
    { value: 'home_bottom', label: t('featured.pos_home_bottom') },
    { value: 'category_top', label: t('featured.pos_cat_top') },
    { value: 'category_bottom', label: t('featured.pos_cat_bottom') }
  ];

  const ASPECT_RATIOS = [
    { value: '1/1', label: t('featured.ratio_1_1') },
    { value: '3/4', label: t('featured.ratio_3_4') },
    { value: '4/3', label: t('featured.ratio_4_3') },
    { value: '16/9', label: t('featured.ratio_16_9') }
  ];

  const [showPicker, setShowPicker] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const loading = zoneLoading || zonesLoading;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over?.id && zone) {
      const oldIndex = zone.products.findIndex(p => p.id === active.id);
      const newIndex = zone.products.findIndex(p => p.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderProducts(oldIndex, newIndex);
      }
    }
  }, [zone, reorderProducts]);

  const handleSave = async () => {
    const isPositionTaken = zones.some(z => z.position === zone.position && String(z.id) !== String(id));
    if (isPositionTaken) {
      showToast(t('featured.msg_position_taken'), 'warning');
      return;
    }

    try {
      const saved = await saveZone();
      if (id === 'new' && saved?.id) {
        navigate(`/admin/featured/${saved.id}`, { replace: true });
      }
      showToast(t("common.update_success"));
    } catch (error) {
      showToast(t('common.update_error') + ': ' + error.message, 'error');
    }
  };

  const handleDeleteZone = async () => {
    if (!(await showConfirm(t("common.confirm_delete"), t("featured.delete_confirm", { name: zone.name })))) return;
    try {
      await deleteZone();
      showToast(t("featured.msg_delete_success"));
      navigate('/admin/featured');
    } catch (error) {
      showToast(t('common.error_occurred') + ': ' + error.message, 'error');
    }
  };

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: 'center' }}>{t("common.loading")}...</div>;
  }

  if (!zone) {
    return <div className="card" style={{ padding: 40, textAlign: 'center' }}>{t("featured.empty_state")}</div>;
  }

  const { gridConfig } = zone;

  return (
    <div className="editor-container">
      {/* Left: Editor */}
      <div className="editor-left">
        <div className="card">
          {/* Header */}
          <div className="cardHead">
            <div>
              <button className="back-btn" onClick={() => navigate('/admin/featured')}>← {t("common.back")}</button>
              <div className="cardTitle">{id === 'new' ? t("featured.modal_add") : t("common.edit") + " " + t("featured.title").toLowerCase()}</div>
            </div>
            <div className="header-actions">
              {id !== 'new' && (
                <button className="btnSmall danger" onClick={handleDeleteZone} disabled={saving}>
                  {t("common.delete")}
                </button>
              )}
              <button className="btnPrimary" onClick={handleSave} disabled={saving}>
                {saving ? t("common.saving") + '...' : hasChanges ? t("common.save_changes") : t("common.saved")}
              </button>
            </div>
          </div>

          {/* Zone Info */}
          <div className="section">
            <h3>{t("featured.section_info")}</h3>
            <div className="form-row">
              <label>
                {t("common.name")}
                <input
                  type="text"
                  value={zone.name}
                  onChange={e => updateZoneInfo({ name: e.target.value })}
                  placeholder="VD: Sản phẩm nổi bật"
                />
              </label>
              <label>
                Slug
                <input
                  type="text"
                  value={zone.slug}
                  onChange={e => updateZoneInfo({ slug: e.target.value })}
                  placeholder="vd: san-pham-noi-bat"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                {t("featured.col_position")}
                <select value={zone.position} onChange={e => updateZoneInfo({ position: e.target.value })}>
                  {POSITIONS.map(p => {
                    const isTaken = zones.some(z => z.position === p.value && String(z.id) !== String(id));
                    return (
                      <option
                        key={p.value}
                        value={p.value}
                        disabled={isTaken}
                      >
                        {p.label} {isTaken ? '(' + t("common.used") + ')' : ''}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={zone.isActive}
                  onChange={e => updateZoneInfo({ isActive: e.target.checked })}
                />
                {t("common.activated")}
              </label>
            </div>
          </div>

          {/* Grid Config */}
          <div className="section">
            <h3>{t("featured.section_grid")}</h3>
            <div className="form-row triple">
              <label>
                {t("featured.label_columns")}
                <select value={gridConfig.columns} onChange={e => updateGridConfig({ columns: +e.target.value })}>
                  {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {t("featured.unit_columns")}</option>)}
                </select>
              </label>
              <label>
                {t("featured.label_gap")}
                <input
                  type="number"
                  value={gridConfig.gap}
                  onChange={e => updateGridConfig({ gap: +e.target.value })}
                  min="0"
                  max="48"
                />
              </label>
              <label>
                {t("featured.label_aspect_ratio")}
                <select value={gridConfig.aspectRatio} onChange={e => updateGridConfig({ aspectRatio: e.target.value })}>
                  {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {/* Products */}
          <div className="section">
            <div className="section-header">
              <h3>{t("common.products")} ({zone.products.length})</h3>
            </div>

            {/* Toolbar */}
            <div className="products-toolbar">
              <button className="toolbar-btn primary" onClick={() => setShowPicker(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t("featured.btn_add_product")}
              </button>

              <div className="toolbar-divider" />

              <button
                className="toolbar-btn"
                onClick={() => {
                  if (zone.products.length > 1) {
                    setProducts([...zone.products].reverse());
                  }
                }}
                disabled={zone.products.length < 2}
                title={t("featured.tip_reverse")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                {t("featured.btn_reverse")}
              </button>

              <button
                className="toolbar-btn"
                onClick={() => {
                  if (zone.products.length > 1) {
                    const products = [...zone.products];
                    const first = products.shift();
                    products.push(first);
                    setProducts(products);
                  }
                }}
                disabled={zone.products.length < 2}
                title={t("featured.tip_rotate")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-4.219-7.619" />
                  <path d="M21 3v6h-6" />
                </svg>
                {t("featured.btn_rotate")}
              </button>

              <div className="toolbar-divider" />

              <button
                className="toolbar-btn danger"
                onClick={async () => {
                  if (zone.products.length > 0 && (await showConfirm(t("common.confirm_delete"), t("featured.msg_clear_all")))) {
                    setProducts([]);
                  }
                }}
                disabled={zone.products.length === 0}
                title={t("featured.tip_clear")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                </svg>
                {t("featured.btn_clear")}
              </button>
            </div>

            {zone.products.length === 0 ? (
              <div className="empty-products">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: 12 }}>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <p>{t("common.empty_state")}</p>
                <button className="btnPrimary" onClick={() => setShowPicker(true)}>+ {t("featured.btn_add_product")}</button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={zone.products.map(p => p.id)} strategy={rectSortingStrategy}>
                  <div className="products-list">
                    {zone.products.map((item, index) => (
                      <SortableProduct
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={removeProduct}
                        onEditThumbnail={setEditingProduct}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="editor-right">
        <div className="card preview-card">
          <h3>Preview</h3>
          <div
            className="preview-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
              gap: `${gridConfig.gap}px`
            }}
          >
            {zone.products.map(item => (
              <div key={item.id} className="preview-item" style={{ aspectRatio: gridConfig.aspectRatio }}>
                <img
                  src={item.customThumbnail || item.product?.image || '/placeholder.jpg'}
                  alt={item.product?.name}
                />
                <div className="preview-overlay">
                  <span className="preview-name">{item.product?.name}</span>
                  <span className="preview-price">{formatVND(item.product?.price || 0)}</span>
                </div>
              </div>
            ))}
          </div>
          {zone.products.length === 0 && (
            <div className="preview-empty">{t("featured.tip_preview_empty")}</div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPicker && (
        <ProductPicker
          excludeIds={zone.products.map(p => p.productId)}
          onSelect={(product) => {
            addProduct(product);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {editingProduct && (
        <ThumbnailEditor
          product={editingProduct}
          onSave={(url) => {
            updateThumbnail(editingProduct.id, url);
            setEditingProduct(null);
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}

      <style>{`
        .editor-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
          min-height: calc(100vh - 120px);
        }
        .editor-left .card {
          height: fit-content;
        }
        .back-btn {
          background: none;
          border: none;
          color: var(--admin-text-muted);
          cursor: pointer;
          padding: 0;
          font-size: 13px;
          margin-bottom: 4px;
        }
        .back-btn:hover {
          color: var(--admin-accent);
        }
        .section {
          padding: 20px 0;
          border-bottom: 1px solid var(--admin-border);
        }
        .section:last-child {
          border-bottom: none;
        }
        .section h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: var(--admin-text);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-header h3 {
          margin: 0;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 12px;
        }
        .form-row.triple {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .form-row label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: var(--admin-text-muted);
        }
        .form-row input, .form-row select {
          padding: 10px 12px;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md);
          background: var(--admin-bg);
          color: var(--admin-text);
          font-size: 14px;
        }
        .checkbox-label {
          flex-direction: row !important;
          align-items: center !important;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
        }
        .products-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .product-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md);
        }
        .drag-handle {
          color: var(--admin-text-muted);
          cursor: grab;
          padding: 4px;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .product-thumb {
          width: 48px;
          height: 48px;
          border-radius: var(--admin-radius-sm);
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s;
        }
        .product-thumb:hover {
          border-color: var(--admin-accent);
        }
        .product-info {
          flex: 1;
          min-width: 0;
        }
        .product-name {
          font-weight: 500;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
        }
        .product-price {
          font-size: 12px;
          color: var(--admin-accent);
          margin-top: 2px;
        }
        .remove-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--admin-text-muted);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .empty-products {
          text-align: center;
          padding: 40px;
          color: var(--admin-text-muted);
        }
        .preview-card {
          position: sticky;
          top: 24px;
        }
        .preview-card h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--admin-border);
        }
        .preview-grid {
          background: var(--admin-bg);
          border-radius: var(--admin-radius-md);
          padding: 12px;
        }
        .preview-item {
          position: relative;
          border-radius: var(--admin-radius-md);
          overflow: hidden;
          background: var(--admin-surface);
        }
        .preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .preview-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: white;
        }
        .preview-name {
          display: block;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preview-price {
          font-size: 10px;
          opacity: 0.8;
        }
        .preview-empty {
          padding: 60px 20px;
          text-align: center;
          color: var(--admin-text-muted);
          background: var(--admin-bg);
          border-radius: var(--admin-radius-md);
        }
        .btnPrimary {
          padding: 10px 20px;
          border: none;
          border-radius: var(--admin-radius-md);
          background: var(--admin-accent);
          color: #000;
          font-weight: 600;
          cursor: pointer;
        }
        .btnPrimary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btnSmall {
          padding: 6px 12px;
          font-size: 12px;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md);
          background: transparent;
          color: var(--admin-text);
          cursor: pointer;
        }
        .btnSmall:hover {
          background: var(--glass-hover);
        }
        /* Toolbar styles */
        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .header-actions .btnSmall {
          padding: 8px 16px;
          height: 38px;
        }
        .header-actions .btnPrimary {
          height: 38px;
        }
        .products-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg);
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
        }
        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md);
          background: var(--admin-surface);
          color: var(--admin-text);
          cursor: pointer;
          transition: all 0.15s;
        }
        .toolbar-btn:hover:not(:disabled) {
          background: var(--glass-hover);
          border-color: var(--admin-text-muted);
        }
        .toolbar-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .toolbar-btn.primary {
          background: var(--admin-accent);
          border-color: var(--admin-accent);
          color: #000;
        }
        .toolbar-btn.primary:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        .toolbar-btn.danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          color: #ef4444;
        }
        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--admin-border);
        }
        @media (max-width: 1024px) {
          .editor-container {
            grid-template-columns: 1fr;
          }
          .editor-right {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
