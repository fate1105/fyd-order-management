import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import "../styles/pages.css";
import { useFeaturedZones, createNewZone } from "../hooks/useFeaturedZone";

const POSITIONS = {
    home_hero: "Trang chủ - Hero",
    home_featured: "Trang chủ - Nổi bật",
    home_bottom: "Trang chủ - Cuối trang",
    category_top: "Category - Đầu trang",
    category_bottom: "Category - Cuối trang"
};

export default function FeaturedZones() {
    const navigate = useNavigate();
    const { zones, loading, createZone, deleteZone, toggleZone } = useFeaturedZones();
    const [creating, setCreating] = useState(false);
    const [newZoneName, setNewZoneName] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const handleCreate = async () => {
        if (!newZoneName.trim()) return;

        try {
            const zone = createNewZone();
            zone.name = newZoneName;
            zone.slug = newZoneName.toLowerCase().replace(/\s+/g, '-');
            const created = await createZone(zone);
            setCreating(false);
            setNewZoneName("");
            navigate(`/admin/featured/${created.id}`);
        } catch (error) {
            alert("Không thể tạo khu vực: " + error.message);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xóa khu vực "${name}"?`)) return;
        setDeletingId(id);
        try {
            await deleteZone(id);
        } catch (error) {
            alert("Không thể xóa: " + error.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="card">
            <div className="cardHead">
                <div>
                    <div className="cardTitle">Khu vực sản phẩm nổi bật</div>
                    <div className="cardSub">Quản lý các khu vực hiển thị sản phẩm nổi bật trên website</div>
                </div>
                <button className="btnPrimary" onClick={() => setCreating(true)}>
                    + Tạo khu vực
                </button>
            </div>

            {/* Create zone modal */}
            {creating && (
                <div className="modal-overlay" onClick={() => setCreating(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Tạo khu vực mới</h3>
                        <input
                            type="text"
                            className="input"
                            placeholder="Tên khu vực (VD: Sản phẩm nổi bật)"
                            value={newZoneName}
                            onChange={e => setNewZoneName(e.target.value)}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setCreating(false)}>Hủy</button>
                            <button className="btnPrimary" onClick={handleCreate}>Tạo</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>
            ) : zones.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.5 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                    </svg>
                    <p>Chưa có khu vực nào</p>
                    <button className="btnPrimary" style={{ marginTop: 16 }} onClick={() => setCreating(true)}>
                        + Tạo khu vực đầu tiên
                    </button>
                </div>
            ) : (
                <div className="table">
                    <div className="tr th">
                        <div style={{ flex: 2 }}>Tên khu vực</div>
                        <div style={{ flex: 1 }}>Vị trí</div>
                        <div style={{ width: 80, textAlign: 'center' }}>Sản phẩm</div>
                        <div style={{ width: 100, textAlign: 'center' }}>Trạng thái</div>
                        <div style={{ width: 120 }}></div>
                    </div>

                    {zones.map(zone => (
                        <div className="tr" key={zone.id}>
                            <div style={{ flex: 2 }}>
                                <div style={{ fontWeight: 600 }}>{zone.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>
                                    /{zone.slug}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <span className="chip">{POSITIONS[zone.position] || zone.position}</span>
                            </div>
                            <div style={{ width: 80, textAlign: 'center' }}>
                                {zone.products?.length || 0}
                            </div>
                            <div style={{ width: 100, textAlign: 'center' }}>
                                <button
                                    className={`toggle ${zone.isActive ? 'on' : ''}`}
                                    onClick={() => toggleZone(zone.id)}
                                    title={zone.isActive ? 'Đang bật' : 'Đang tắt'}
                                >
                                    <span className="toggle-dot" />
                                </button>
                            </div>
                            <div style={{ width: 120, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button
                                    className="btnSmall"
                                    onClick={() => navigate(`/admin/featured/${zone.id}`)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className="btnSmall danger"
                                    onClick={() => handleDelete(zone.id, zone.name)}
                                    disabled={deletingId === zone.id}
                                >
                                    {deletingId === zone.id ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
        .modal-content {
          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-lg);
          padding: 24px;
          width: 400px;
          max-width: 90vw;
        }
        .modal-content h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }
        .modal-content .input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md);
          background: var(--admin-bg);
          color: var(--admin-text);
          font-size: 14px;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .btn {
          padding: 10px 20px;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-md);
          background: transparent;
          color: var(--admin-text);
          cursor: pointer;
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
        .btnSmall.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          color: #ef4444;
        }
        .toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          border: none;
          background: var(--admin-border);
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle.on {
          background: var(--admin-success);
        }
        .toggle-dot {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          transition: transform 0.2s;
        }
        .toggle.on .toggle-dot {
          transform: translateX(20px);
        }
      `}</style>
        </div>
    );
}
