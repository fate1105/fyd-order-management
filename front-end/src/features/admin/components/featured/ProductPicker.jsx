import { useState, useEffect } from 'react';
import { productAPI, formatVND } from '@shared/utils/api.js';

export default function ProductPicker({ excludeIds = [], onSelect, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ size: 100 });
        setProducts(res.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = products
    .filter(p => !excludeIds.includes(p.id))
    .filter(p =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <h3>Chọn sản phẩm</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="picker-search">
          <input
            type="text"
            placeholder="Tìm theo tên, SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="picker-list">
          {loading ? (
            <div className="picker-loading">Đang tải...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="picker-empty">
              {search ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm khả dụng'}
            </div>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="picker-item"
                onClick={() => onSelect(product)}
              >
                <img
                  src={product.thumbnail || product.images?.[0]?.imageUrl || '/placeholder.jpg'}
                  alt={product.name}
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
                <div className="picker-item-info">
                  <div className="picker-item-name">{product.name}</div>
                  <div className="picker-item-meta">
                    <span>{product.sku}</span>
                    <span>{formatVND(product.salePrice || product.basePrice)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .picker-modal {
            background: var(--admin-surface);
            border: 1px solid var(--admin-border);
            border-radius: var(--admin-radius-lg);
            width: 500px;
            max-width: 95vw;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
          }
          .picker-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--admin-border);
          }
          .picker-header h3 {
            margin: 0;
            font-size: 16px;
          }
          .close-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--admin-text-muted);
            font-size: 24px;
            cursor: pointer;
            border-radius: var(--admin-radius-md);
          }
          .close-btn:hover {
            background: var(--glass-hover);
          }
          .picker-search {
            padding: 12px 20px;
            border-bottom: 1px solid var(--admin-border);
          }
          .picker-search input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--admin-border);
            border-radius: var(--admin-radius-md);
            background: var(--admin-bg);
            color: var(--admin-text);
            font-size: 14px;
          }
          .picker-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
          }
          .picker-loading, .picker-empty {
            padding: 40px;
            text-align: center;
            color: var(--admin-text-muted);
          }
          .picker-item {
            display: flex;
            gap: 12px;
            padding: 10px 12px;
            border-radius: var(--admin-radius-md);
            cursor: pointer;
            transition: background 0.15s;
          }
          .picker-item:hover {
            background: var(--glass-hover);
          }
          .picker-item img {
            width: 48px;
            height: 48px;
            border-radius: var(--admin-radius-sm);
            object-fit: cover;
          }
          .picker-item-info {
            flex: 1;
            min-width: 0;
          }
          .picker-item-name {
            font-weight: 500;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .picker-item-meta {
            display: flex;
            gap: 12px;
            margin-top: 4px;
            font-size: 12px;
            color: var(--admin-text-muted);
          }
          .picker-item-meta span:last-child {
            color: var(--admin-accent);
          }
        `}</style>
      </div>
    </div>
  );
}
