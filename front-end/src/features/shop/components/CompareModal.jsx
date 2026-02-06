import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCompare } from "@shared/context/CompareContext";
import { useTranslation } from "react-i18next";
import { formatVND } from "@shared/utils/api.js";
import "../styles/CompareModal.css";

export default function CompareModal() {
    const {
        compareList,
        removeFromCompare,
        clearCompare,
        isCompareModalOpen,
        closeCompareModal
    } = useCompare();
    const { t } = useTranslation();

    // Prevent scroll when modal is open
    useEffect(() => {
        if (isCompareModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCompareModalOpen]);

    if (!isCompareModalOpen) return null;

    const features = [
        { key: "category", label: t("shop.spec_category") },
        { key: "price", label: t("shop.spec_price") },
        { key: "stock", label: t("shop.spec_stock") },
        { key: "rating", label: t("shop.spec_rating") },
        { key: "description", label: t("shop.spec_desc") },
    ];

    return (
        <div className="compare-modal-overlay" onClick={closeCompareModal}>
            <div className="compare-modal-container" onClick={(e) => e.stopPropagation()}>
                <header className="compare-modal-header">
                    <div className="compare-modal-title">
                        <h2>{t("shop.compare_title")}</h2>
                        <p>{t("shop.compare_subtitle", { count: compareList.length })}</p>
                    </div>
                    <button className="close-modal-btn" onClick={closeCompareModal}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </header>

                <main className="compare-modal-content">
                    {compareList.length === 0 ? (
                        <div className="modal-empty-state">
                            <h3>{t("shop.compare_empty")}</h3>
                            <p>{t("shop.compare_empty_desc")}</p>
                            <button className="back-btn-shop" style={{ marginTop: '24px' }} onClick={closeCompareModal}>
                                {t("shop.back_to_shop")}
                            </button>
                        </div>
                    ) : (
                        <div
                            className="compare-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `220px repeat(${compareList.length}, 1fr)`,
                                width: '100%',
                                background: 'var(--shop-gray-200)',
                                gap: '1px'
                            }}
                        >
                            {/* ROW 1: PRODUCT TOP */}
                            <div className="compare-cell compare-label-cell product-top-label" style={{ minHeight: '350px' }}>
                                {t("shop.product")}
                            </div>
                            {compareList.map(product => (
                                <div key={`header-${product.id}`} className="compare-cell product-top-cell" style={{ minHeight: '350px' }}>
                                    <div className="compare-product-top">
                                        <img src={product.thumbnail || product.image || 'https://via.placeholder.com/400x400?text=No+Image'} alt={product.name} />
                                        <Link to={`/shop/product/${product.id}`} className="compare-product-name" onClick={closeCompareModal}>
                                            {product.name}
                                        </Link>
                                        <div className="compare-price">{formatVND(product.salePrice || product.basePrice)}</div>
                                        {product.salePrice && product.salePrice < product.basePrice && (
                                            <div className="compare-price-old">
                                                {formatVND(product.basePrice)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* ROW 2: CATEGORY */}
                            <div className="compare-cell compare-label-cell">{t("shop.spec_category")}</div>
                            {compareList.map(product => (
                                <div key={`cat-${product.id}`} className="compare-cell">
                                    {product.categoryName || product.category?.name || product.category || t("common.no_category", "N/A")}
                                </div>
                            ))}

                            {/* ROW 3: PRICE (Detailed Row) */}
                            <div className="compare-cell compare-label-cell">{t("shop.spec_price")}</div>
                            {compareList.map(product => (
                                <div key={`price-${product.id}`} className="compare-cell" style={{ fontWeight: '700' }}>
                                    {formatVND(product.salePrice || product.basePrice)}
                                </div>
                            ))}

                            {/* ROW 4: STOCK */}
                            <div className="compare-cell compare-label-cell">{t("shop.spec_stock")}</div>
                            {compareList.map(product => (
                                <div key={`stock-${product.id}`} className="compare-cell">
                                    {product.totalStock > 0 ? (
                                        <span className="stock-badge in">
                                            {t("shop.in_stock")}: {product.totalStock}
                                        </span>
                                    ) : (
                                        <span className="stock-badge out">
                                            {t("shop.out_of_stock")}
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* ROW 5: RATING */}
                            <div className="compare-cell compare-label-cell">{t("shop.spec_rating")}</div>
                            {compareList.map(product => (
                                <div key={`rating-${product.id}`} className="compare-cell">
                                    {product.rating ? (
                                        <div className="compare-stars">
                                            <span className="star-icon">★</span>
                                            <span>{product.rating.toFixed(1)}</span>
                                        </div>
                                    ) : "—"}
                                </div>
                            ))}

                            {/* ROW 6: DESCRIPTION */}
                            <div className="compare-cell compare-label-cell">{t("shop.spec_desc")}</div>
                            {compareList.map(product => (
                                <div key={`desc-${product.id}`} className="compare-cell desc-cell">
                                    <p>{product.description ? (product.description.substring(0, 150) + "...") : "—"}</p>
                                </div>
                            ))}

                            {/* ROW 7: ACTIONS */}
                            <div className="compare-cell compare-label-cell">{t("common.action")}</div>
                            {compareList.map(product => (
                                <div key={`action-${product.id}`} className="compare-cell">
                                    <button className="compare-remove-btn" onClick={() => removeFromCompare(product.id)}>
                                        {t("common.remove")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <footer className="compare-modal-footer">
                    <button className="clear-all-compare" style={{ fontSize: '13px', fontWeight: '800' }} onClick={clearCompare}>
                        {t("shop.clear_all_comparison")}
                    </button>
                </footer>
            </div >
        </div >
    );
}
