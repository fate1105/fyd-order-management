import React from "react";
import { useCompare } from "@shared/context/CompareContext";
import { useTranslation } from "react-i18next";
import "../styles/CompareDrawer.css";

export default function CompareDrawer() {
    const { compareList, removeFromCompare, clearCompare, compareCount, openCompareModal } = useCompare();
    const { t } = useTranslation();

    if (compareCount === 0) return null;

    return (
        <div className={`compare-drawer ${compareCount > 0 ? "open" : ""}`}>
            <div className="compare-drawer-inner">
                <div className="compare-title-mini">
                    {t("shop.compare_title")}
                </div>
                <div className="compare-items">
                    {compareList.map((product) => (
                        <div key={product.id} className="compare-item-mini">
                            <img src={product.thumbnail || product.image} alt={product.name} />
                            <button
                                className="remove-compare"
                                onClick={() => removeFromCompare(product.id)}
                                title={t("common.remove")}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    {[...Array(4 - compareCount)].map((_, i) => (
                        <div key={`empty-${i}`} className="compare-item-mini empty" style={{ borderStyle: 'dashed', opacity: 0.15 }}>
                            <div style={{ paddingBottom: '100%' }}></div>
                        </div>
                    ))}
                </div>

                <div className="compare-actions">
                    <button className="compare-btn-main" onClick={openCompareModal}>
                        {t("shop.compare_now")} ({compareCount}/4)
                    </button>
                    <button className="clear-all-compare" onClick={clearCompare}>
                        {t("shop.clear_all")}
                    </button>
                </div>
            </div>
        </div>
    );
}
