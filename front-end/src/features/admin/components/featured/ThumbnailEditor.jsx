import { useState } from 'react';

export default function ThumbnailEditor({ product, onSave, onClose }) {
    const [url, setUrl] = useState(product.customThumbnail || '');
    const [previewUrl, setPreviewUrl] = useState(product.customThumbnail || product.product?.image || '');

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        if (newUrl) {
            setPreviewUrl(newUrl);
        } else {
            setPreviewUrl(product.product?.image || '');
        }
    };

    const handleSave = () => {
        onSave(url || null);
    };

    const handleReset = () => {
        setUrl('');
        setPreviewUrl(product.product?.image || '');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="thumb-modal" onClick={e => e.stopPropagation()}>
                <div className="thumb-header">
                    <h3>Chỉnh sửa thumbnail</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="thumb-content">
                    <div className="thumb-preview">
                        <img
                            src={previewUrl || '/placeholder.jpg'}
                            alt={product.product?.name}
                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                    </div>

                    <div className="thumb-info">
                        <div className="product-name">{product.product?.name}</div>
                        <p className="hint">
                            Nhập URL ảnh tùy chỉnh hoặc để trống để dùng ảnh mặc định của sản phẩm.
                        </p>

                        <label>
                            URL Thumbnail tùy chỉnh
                            <input
                                type="url"
                                value={url}
                                onChange={handleUrlChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </label>

                        <div className="thumb-actions">
                            <button className="btn-secondary" onClick={handleReset}>
                                Đặt lại mặc định
                            </button>
                            <button className="btn-primary" onClick={handleSave}>
                                Lưu
                            </button>
                        </div>
                    </div>
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
          .thumb-modal {
            background: var(--admin-surface);
            border: 1px solid var(--admin-border);
            border-radius: var(--admin-radius-lg);
            width: 480px;
            max-width: 95vw;
          }
          .thumb-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--admin-border);
          }
          .thumb-header h3 {
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
          .thumb-content {
            padding: 20px;
          }
          .thumb-preview {
            width: 100%;
            aspect-ratio: 1/1;
            max-height: 200px;
            border-radius: var(--admin-radius-md);
            overflow: hidden;
            background: var(--admin-bg);
            margin-bottom: 16px;
          }
          .thumb-preview img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .thumb-info .product-name {
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 8px;
          }
          .thumb-info .hint {
            font-size: 12px;
            color: var(--admin-text-muted);
            margin-bottom: 16px;
          }
          .thumb-info label {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 13px;
            color: var(--admin-text-muted);
          }
          .thumb-info input {
            padding: 10px 12px;
            border: 1px solid var(--admin-border);
            border-radius: var(--admin-radius-md);
            background: var(--admin-bg);
            color: var(--admin-text);
            font-size: 14px;
          }
          .thumb-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .btn-secondary {
            padding: 10px 16px;
            border: 1px solid var(--admin-border);
            border-radius: var(--admin-radius-md);
            background: transparent;
            color: var(--admin-text);
            cursor: pointer;
          }
          .btn-secondary:hover {
            background: var(--glass-hover);
          }
          .btn-primary {
            padding: 10px 20px;
            border: none;
            border-radius: var(--admin-radius-md);
            background: var(--admin-accent);
            color: #000;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
            </div>
        </div>
    );
}
