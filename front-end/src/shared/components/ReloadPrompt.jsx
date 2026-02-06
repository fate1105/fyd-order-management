import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import '@shared/styles/ui-kit.css'

function ReloadPrompt() {
    const swResult = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    });

    // Extremely robust check: swResult must exist AND have the expected properties
    if (!swResult || !Array.isArray(swResult.offlineReady) || !Array.isArray(swResult.needUpdate)) {
        return null;
    }

    const [offlineReady, setOfflineReady] = swResult.offlineReady;
    const [needUpdate, setNeedUpdate] = swResult.needUpdate;
    const { updateServiceWorker } = swResult;

    const close = () => {
        setOfflineReady(false)
        setNeedUpdate(false)
    }

    return (
        <div className="pwa-toast-container">
            {(offlineReady || needUpdate) && (
                <div className="pwa-toast cyber-glass">
                    <div className="pwa-message">
                        {offlineReady ? (
                            <span>Website đã sẵn sàng để hoạt động ngoại tuyến.</span>
                        ) : (
                            <span>Đã có phiên bản mới! Làm mới để cập nhật ngay.</span>
                        )}
                    </div>
                    <div className="pwa-actions">
                        {needUpdate && (
                            <button className="neon-btn-small" onClick={() => updateServiceWorker(true)}>
                                CẬP NHẬT
                            </button>
                        )}
                        <button className="neon-btn-outline-small" onClick={() => close()}>
                            ĐÓNG
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReloadPrompt
