import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, formatRelativeTime } from '../../hooks/useNotifications.jsx';
import './notifications.css';

// Icon components
const Icons = {
    order: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
        </svg>
    ),
    inventory: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    customer: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    system: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    ai: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
    ),
    promo: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
    check: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    trash: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    more: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
        </svg>
    ),
    inbox: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
    ),
    checkCircle: () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
};

// Filter tabs configuration
const FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'order', label: 'Đơn hàng' },
    { key: 'inventory', label: 'Kho' },
    { key: 'customer', label: 'Khách' },
    { key: 'system', label: 'Hệ thống' },
];

// Notification Item Component
function NotificationItem({ notification, onMarkRead, onDelete, onClick }) {
    const IconComponent = Icons[notification.type] || Icons.system;
    const timeAgo = formatRelativeTime(notification.timestamp);

    const handleClick = () => {
        onClick(notification);
    };

    const handleMarkRead = (e) => {
        e.stopPropagation();
        onMarkRead(notification.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(notification.id);
    };

    return (
        <div
            className={`notif-item ${notification.isRead ? '' : 'unread'} priority-${notification.priority}`}
            onClick={handleClick}
            role="listitem"
            tabIndex={0}
            aria-label={`${notification.title}, ${timeAgo}, ${notification.isRead ? 'đã đọc' : 'chưa đọc'}`}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
            <div className={`notif-icon ${notification.type}`}>
                <IconComponent />
            </div>
            <div className="notif-body">
                <div className="notif-row">
                    <span className="notif-item-title">{notification.title}</span>
                    <span className="notif-time">{timeAgo}</span>
                </div>
                <p className="notif-desc">{notification.description}</p>
            </div>
            <div className="notif-actions">
                {!notification.isRead && (
                    <button
                        className="notif-action-btn"
                        onClick={handleMarkRead}
                        title="Đánh dấu đã đọc"
                        aria-label="Đánh dấu đã đọc"
                    >
                        <Icons.check />
                    </button>
                )}
                <button
                    className="notif-action-btn delete"
                    onClick={handleDelete}
                    title="Xóa"
                    aria-label="Xóa thông báo"
                >
                    <Icons.trash />
                </button>
            </div>
            {!notification.isRead && <span className="notif-unread-dot" />}
        </div>
    );
}

// Empty State Component
function NotificationEmpty({ filter }) {
    const messages = {
        all: { icon: <Icons.inbox />, text: 'Không có thông báo nào' },
        unread: { icon: <Icons.checkCircle />, text: 'Tuyệt vời! Bạn đã đọc hết' },
        order: { icon: <Icons.order />, text: 'Không có thông báo đơn hàng' },
        inventory: { icon: <Icons.inventory />, text: 'Không có cảnh báo tồn kho' },
        customer: { icon: <Icons.customer />, text: 'Không có thông báo khách hàng' },
        system: { icon: <Icons.system />, text: 'Không có thông báo hệ thống' },
    };

    const { icon, text } = messages[filter] || messages.all;

    return (
        <div className="notif-empty">
            <div className="notif-empty-icon">{icon}</div>
            <p className="notif-empty-text">{text}</p>
        </div>
    );
}

// Loading State Component
function NotificationLoading({ count = 3 }) {
    return (
        <div className="notif-loading">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="notif-skeleton">
                    <div className="notif-skeleton-icon" />
                    <div className="notif-skeleton-body">
                        <div className="notif-skeleton-title" />
                        <div className="notif-skeleton-desc" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Main NotificationPanel Component
export default function NotificationPanel({ isOpen, onClose }) {
    const navigate = useNavigate();
    const panelRef = useRef(null);
    const {
        notifications,
        loading,
        hasMore,
        activeFilter,
        counts,
        markRead,
        markAllRead,
        deleteNotification,
        loadMore,
        changeFilter,
    } = useNotifications();

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Handle click on notification item
    const handleItemClick = useCallback((notification) => {
        // Mark as read
        if (!notification.isRead) {
            markRead(notification.id);
        }

        // Navigate if action has URL
        if (notification.action?.type === 'navigate' && notification.action?.url) {
            onClose();
            navigate(notification.action.url);
        }
    }, [markRead, navigate, onClose]);

    return (
        <div
            ref={panelRef}
            className={`notif-panel ${isOpen ? 'show' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Panel thông báo"
        >
            {/* Header */}
            <div className="notif-header">
                <span className="notif-header-title">Thông báo</span>
                <div className="notif-header-actions">
                    {counts.unread > 0 && (
                        <span className="notif-badge">{counts.unread} mới</span>
                    )}
                    <button
                        className="notif-header-btn"
                        onClick={markAllRead}
                        title="Đánh dấu tất cả đã đọc"
                        aria-label="Đánh dấu tất cả đã đọc"
                    >
                        <Icons.check />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="notif-filters" role="tablist" aria-label="Lọc thông báo">
                {FILTERS.map((filter) => (
                    <button
                        key={filter.key}
                        role="tab"
                        aria-selected={activeFilter === filter.key}
                        className={`notif-filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
                        onClick={() => changeFilter(filter.key)}
                    >
                        {filter.label}
                        {counts[filter.key] > 0 && filter.key !== 'all' && (
                            <span className="notif-filter-count">{counts[filter.key]}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="notif-list" role="list" aria-label="Danh sách thông báo">
                {loading ? (
                    <NotificationLoading />
                ) : notifications.length === 0 ? (
                    <NotificationEmpty filter={activeFilter} />
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={markRead}
                            onDelete={deleteNotification}
                            onClick={handleItemClick}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            {hasMore && !loading && (
                <button className="notif-footer" onClick={loadMore}>
                    Xem thêm thông báo →
                </button>
            )}

            {notifications.length > 0 && (
                <button
                    className="notif-footer"
                    onClick={() => {
                        onClose();
                        navigate('/admin/notifications');
                    }}
                >
                    Xem tất cả thông báo →
                </button>
            )}
        </div>
    );
}
