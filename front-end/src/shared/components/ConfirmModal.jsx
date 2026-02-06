import { createPortal } from 'react-dom';
import '../styles/confirm.css';

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
    if (!show) return null;

    return createPortal(
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-header">
                    <div className="confirm-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h3>{title}</h3>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-footer">
                    <button className="confirm-btn-cancel" onClick={onCancel}>Hủy</button>
                    <button className="confirm-btn-ok" onClick={onConfirm}>Đồng ý</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
