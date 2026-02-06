import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationAPI } from '@shared/utils/api.js';

const FILTER_TYPES = ['all', 'unread', 'order', 'inventory', 'customer', 'system'];
const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

// Create Context
const NotificationContext = createContext(null);

// Provider Component
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [counts, setCounts] = useState({
        all: 0, unread: 0, order: 0, inventory: 0, customer: 0, system: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [hasMore, setHasMore] = useState(false);

    // Load notifications from API
    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await notificationAPI.getAll();
            setNotifications(response.notifications || []);
            setCounts(response.counts || {
                all: 0, unread: 0, order: 0, inventory: 0, customer: 0, system: 0
            });
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setNotifications([]);
        }
        setLoading(false);
    }, []);

    // Load on mount and poll every 30 seconds
    useEffect(() => {
        loadNotifications();

        // Poll for new notifications every 30 seconds
        const pollInterval = setInterval(() => {
            loadNotifications();
        }, 30000);

        return () => clearInterval(pollInterval);
    }, [loadNotifications]);

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !n.isRead;
        return n.type === activeFilter;
    });

    // Sort by priority then by timestamp
    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
        const priorityDiff = (PRIORITY_ORDER[a.priority] || 3) - (PRIORITY_ORDER[b.priority] || 3);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const unreadCount = counts.unread || 0;
    const hasUrgent = notifications.some(n => n.priority === 'urgent' && !n.isRead);

    // Mark single notification as read
    const markRead = useCallback(async (id) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification || notification.isRead) return;

        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setCounts(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1),
            [notification.type]: Math.max(0, (prev[notification.type] || 0) - 1)
        }));

        try {
            await notificationAPI.markRead(id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Reload on error
            loadNotifications();
        }
    }, [notifications, loadNotifications]);

    // Mark all as read
    const markAllRead = useCallback(async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setCounts(prev => ({
            ...prev,
            unread: 0,
            order: 0,
            inventory: 0,
            customer: 0,
            system: 0
        }));

        try {
            await notificationAPI.markAllRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            loadNotifications();
        }
    }, [loadNotifications]);

    // Delete notification
    const deleteNotification = useCallback(async (id) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification) return;

        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));

        if (!notification.isRead) {
            setCounts(prev => ({
                ...prev,
                all: Math.max(0, prev.all - 1),
                unread: Math.max(0, prev.unread - 1),
                [notification.type]: Math.max(0, (prev[notification.type] || 0) - 1)
            }));
        } else {
            setCounts(prev => ({ ...prev, all: Math.max(0, prev.all - 1) }));
        }

        try {
            await notificationAPI.delete(id);
        } catch (error) {
            console.error('Failed to delete notification:', error);
            loadNotifications();
        }
    }, [notifications, loadNotifications]);

    // Clear all
    const clearAll = useCallback(() => {
        setNotifications([]);
        setCounts({ all: 0, unread: 0, order: 0, inventory: 0, customer: 0, system: 0 });
    }, []);

    // Load more (refresh)
    const loadMore = useCallback(async () => {
        await loadNotifications();
    }, [loadNotifications]);

    // Change filter
    const changeFilter = useCallback((filter) => {
        if (FILTER_TYPES.includes(filter)) {
            setActiveFilter(filter);
        }
    }, []);

    const value = {
        notifications: sortedNotifications,
        loading,
        hasMore,
        activeFilter,
        counts,
        unreadCount,
        hasUrgent,
        markRead,
        markAllRead,
        deleteNotification,
        clearAll,
        loadMore,
        changeFilter,
        refresh: loadNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// Hook to use notification context
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

// Format relative time
export function formatRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

export default useNotifications;
