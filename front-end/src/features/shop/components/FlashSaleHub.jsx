import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { productAPI, promotionAPI } from "@shared/utils/api.js";
import ProductCard from "./ProductCard";
import "../styles/flash-sale.css";

export default function FlashSaleHub({ onQuickView, onToggleWishlist, wishlist = [] }) {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [flashSale, setFlashSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlashSaleData();
    }, []);

    const fetchFlashSaleData = async () => {
        setLoading(true);
        console.log("Fetching Flash Sale data...");
        try {
            // Get active flash sale promotion
            const sales = await promotionAPI.getFlashSales();
            console.log("Flash Sale Promotions:", sales);

            if (sales && sales.length > 0) {
                // Take the one that ends soonest
                const activeSale = sales[0];
                setFlashSale(activeSale);

                // Get products for flash sale
                const saleProducts = await productAPI.getFlashSale();
                console.log("Flash Sale Products:", saleProducts);
                setProducts(saleProducts || []);
            } else {
                console.log("No active Flash Sale promotions found.");
            }
        } catch (error) {
            console.error("Failed to fetch flash sale data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!flashSale || !flashSale.endDate) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(flashSale.endDate).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, [flashSale]);

    if (loading) return null;
    if (!flashSale || products.length === 0) return null;

    return (
        <section className="flash-sale-hub">
            <div className="flash-sale-container">
                <div className="flash-sale-header">
                    <div className="flash-sale-title">
                        <div className="flash-tag">⚡ FLASH SALE</div>
                        <h2>{t("shop.flash_sale_title")}</h2>
                        <div className="countdown-timer">
                            <div className="time-block">
                                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                            </div>
                            <span className="separator">:</span>
                            <div className="time-block">
                                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                            </div>
                            <span className="separator">:</span>
                            <div className="time-block">
                                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                    {flashSale.code && (
                        <div className="flash-promo">
                            {t("promotions.label_code")}: <span className="promo-code">{flashSale.code}</span>
                        </div>
                    )}
                </div>

                <div className="flash-sale-products">
                    <div className="products-scroll-container">
                        {products.map(product => (
                            <div key={product.id} className="flash-product-wrapper">
                                <ProductCard
                                    product={product}
                                    onQuickView={onQuickView}
                                    onToggleWishlist={onToggleWishlist}
                                    isWishlisted={wishlist.includes(product.id)}
                                />
                                {product.salePrice && product.basePrice && (
                                    <div className="discount-badge-large">
                                        -{Math.round((1 - product.salePrice / product.basePrice) * 100)}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
