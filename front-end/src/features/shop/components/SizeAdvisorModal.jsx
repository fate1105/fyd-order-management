import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { aiAPI } from "@shared/utils/api.js";
import "../styles/size-advisor.css";

export default function SizeAdvisorModal({ isOpen, onClose, product }) {
    const { t } = useTranslation();
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [fit, setFit] = useState("regular");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setResult(null);
            setError("");

            // Try to load saved measurements
            const saved = localStorage.getItem("fyd-measurements");
            if (saved) {
                try {
                    const { h, w, f } = JSON.parse(saved);
                    setHeight(h || "");
                    setWeight(w || "");
                    setFit(f || "regular");
                } catch (e) { }
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!height || !weight) {
            setError("Vui lòng nhập chiều cao và cân nặng");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await aiAPI.suggestSize(product.id, height, weight, fit);
            if (response.success) {
                setResult(response.reply);

                // Save measurements for next time
                localStorage.setItem("fyd-measurements", JSON.stringify({
                    h: height,
                    w: weight,
                    f: fit
                }));
            } else {
                setError(response.error || "Không thể lấy gợi ý lúc này. Vui lòng thử lại.");
            }
        } catch (err) {
            setError("Lỗi kết nối. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="size-advisor-overlay" onClick={onClose}>
            <div className="size-advisor-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div className="advisor-header">
                    <div className="advisor-icon">📏</div>
                    <h3>{t("shop.size_advisor_title")}</h3>
                    <p>{t("shop.size_advisor_desc")}</p>
                </div>

                <div className="advisor-content">
                    {!result ? (
                        <form className="advisor-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{t("shop.height_label")}</label>
                                    <input
                                        type="number"
                                        placeholder="VD: 170"
                                        value={height}
                                        onChange={e => setHeight(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t("shop.weight_label")}</label>
                                    <input
                                        type="number"
                                        placeholder="VD: 65"
                                        value={weight}
                                        onChange={e => setWeight(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t("shop.fit_label")}</label>
                                <div className="fit-options">
                                    <button
                                        type="button"
                                        className={fit === "slim" ? "active" : ""}
                                        onClick={() => setFit("slim")}
                                    >
                                        {t("shop.fit_slim")}
                                    </button>
                                    <button
                                        type="button"
                                        className={fit === "regular" ? "active" : ""}
                                        onClick={() => setFit("regular")}
                                    >
                                        {t("shop.fit_regular")}
                                    </button>
                                    <button
                                        type="button"
                                        className={fit === "loose" ? "active" : ""}
                                        onClick={() => setFit("loose")}
                                    >
                                        {t("shop.fit_loose")}
                                    </button>
                                </div>
                            </div>

                            {error && <div className="advisor-error">{error}</div>}

                            <button type="submit" className="advisor-submit" disabled={loading}>
                                {loading ? t("shop.analyzing") : t("shop.get_suggestion")}
                            </button>
                        </form>
                    ) : (
                        <div className="advisor-result">
                            <div className="result-badge">{t("shop.ai_suggestion")}</div>
                            <div className="result-text">{result}</div>
                            <button className="advisor-reset" onClick={() => setResult(null)}>
                                {t("shop.reset_measurements")}
                            </button>
                        </div>
                    )}
                </div>

                <div className="advisor-footer">
                    * Gợi ý chỉ mang tính chất tham khảo dựa trên thông tin trung bình.
                </div>
            </div>
        </div>
    );
}
