import { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications, formatRelativeTime } from '../../hooks/useNotifications.jsx';
import './notifications.css';

// Reuse Icons from NotificationPanel or define here if needed
const Icons = {
    order: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
        </svg>
    ),
    inventory: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    customer: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    system: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    trash: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    close: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    checkAll: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l3 3 7-7" />
            <path d="M2 13l3 3 7-7" />
        </svg>
    ),
    inbox: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
    )
};

const FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'order', label: 'Đơn hàng' },
    { key: 'inventory', label: 'Kho' },
    { key: 'customer', label: 'Khách' },
    { key: 'system', label: 'Hệ thống' },
];

const PRIORITY_LABELS = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp'
};

export default function AllNotificationsModal({ isOpen, onClose }) {
    const {
        notifications,
        loading,
        changeFilter,
        activeFilter,
        counts,
        markRead,
        markAllRead,
        deleteNotification,
        refresh
    } = useNotifications();

    const [searchQuery, setSearchQuery] = useState('');

    // Filter notifications locally for searching
    const filteredNotifications = useMemo(() => {
        return notifications.filter(n =>
            (n.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (n.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
    }, [notifications, searchQuery]);

    const handleItemClick = useCallback((notification) => {
        if (!notification.isRead) {
            markRead(notification.id);
        }
    }, [markRead]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="notif-modal-overlay" onClick={onClose}>
            <div className="notif-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="notif-modal-header">
                    <div className="modal-title-group">
                        <h2>Tất cả thông báo</h2>
                        <span className="modal-subtitle">{counts.all} thông báo tổng cộng</span>
                    </div>
                    <div className="modal-header-actions">
                        <button
                            className="modal-action-btn primary"
                            onClick={markAllRead}
                            disabled={counts.unread === 0}
                        >
                            <Icons.checkAll />
                            Đánh dấu tất cả đã đọc
                        </button>
                        <button className="modal-close-btn" onClick={onClose}>
                            <Icons.close />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="notif-modal-toolbar">
                    <div className="modal-filters">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                className={`modal-filter-tab ${activeFilter === f.key ? 'active' : ''}`}
                                onClick={() => changeFilter(f.key)}
                            >
                                {f.label}
                                {counts[f.key] > 0 && f.key !== 'all' && (
                                    <span className="tab-count">{counts[f.key]}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="modal-search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="notif-modal-content">
                    {loading ? (
                        <div className="modal-loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải thông báo...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="modal-empty-state">
                            <Icons.inbox />
                            <p>{searchQuery ? 'Không tìm thấy thông báo nào phù hợp' : 'Không có thông báo nào'}</p>
                            {searchQuery && (
                                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                                    Xóa tìm kiếm
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="modal-notif-grid">
                            {filteredNotifications.map(notification => {
                                const IconComponent = Icons[notification.type] || Icons.system;
                                return (
                                    <div
                                        key={notification.id}
                                        className={`modal-notif-card ${notification.isRead ? '' : 'unread'} priority-${notification.priority}`}
                                        onClick={() => handleItemClick(notification)}
                                    >
                                        <div className={`card-icon ${notification.type}`}>
                                            <IconComponent />
                                        </div>
                                        <div className="card-content">
                                            <div className="card-header">
                                                <span className="card-title">{notification.title}</span>
                                                <span className="card-time">{formatRelativeTime(notification.timestamp)}</span>
                                            </div>
                                            <p className="card-desc">{notification.description}</p>
                                            <div className="card-footer">
                                                <span className={`priority-tag ${notification.priority || 'medium'}`}>
                                                    {PRIORITY_LABELS[(notification.priority || 'medium').toLowerCase()] || (notification.priority || 'MEDIUM').toUpperCase()}
                                                </span>
                                                <div className="card-actions">
                                                    {!notification.isRead && (
                                                        <button
                                                            className="row-action-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markRead(notification.id);
                                                            }}
                                                        >
                                                            Đã đọc
                                                        </button>
                                                    )}
                                                    <button
                                                        className="row-action-btn delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {!notification.isRead && <div className="card-unread-indicator"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="notif-modal-footer">
                    <div className="footer-stats">
                        Hiển thị {filteredNotifications.length} thông báo
                    </div>
                    <button className="footer-close-btn" onClick={onClose}>
                        Đóng lại
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
