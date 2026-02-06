import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const ConfirmContext = createContext();

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [confirm, setConfirm] = useState({
        show: false,
        title: '',
        message: '',
    });

    // Use a ref to store the resolve function
    const resolver = useRef();

    const showConfirm = useCallback((title, message) => {
        setConfirm({
            show: true,
            title,
            message,
        });

        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setConfirm((prev) => ({ ...prev, show: false }));
        if (resolver.current) resolver.current(true);
    }, []);

    const handleCancel = useCallback(() => {
        setConfirm((prev) => ({ ...prev, show: false }));
        if (resolver.current) resolver.current(false);
    }, []);

    return (
        <ConfirmContext.Provider value={{ showConfirm }}>
            {children}
            <ConfirmModal
                show={confirm.show}
                title={confirm.title}
                message={confirm.message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};
