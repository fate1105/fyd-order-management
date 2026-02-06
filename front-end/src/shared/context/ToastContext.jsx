import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success',
    });

    const showToast = useCallback((message, type = 'success') => {
        setToast({
            show: true,
            message,
            type,
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, show: false }));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};
