import { useState, useEffect, useRef } from "react";
import { featuredAPI, formatVND } from "@shared/utils/api.js";
import "../styles/shop.css";

export default function FeaturedProducts({ position = 'home_featured', onProductClick, onToggleWishlist, wishlist = [] }) {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load active zones from API
    useEffect(() => {
        async function loadZones() {
            try {
                const data = await featuredAPI.getActiveZones();
                setZones(data || []);
            } catch (error) {
                console.error('Failed to load featured zones:', error);
                setZones([]);
            }
            setLoading(false);
        }
        loadZones();
    }, []);

    if (loading) return null; // Let main shop handle loading or show nothing

    // Filter zones by position
    const filteredZones = zones.filter(z => z.position === position);

    if (filteredZones.length === 0) return null;

    return (
        <>
            {filteredZones.map(zone => (
                <FeaturedZoneItem
                    key={zone.id}
                    zone={zone}
                    onProductClick={onProductClick}
                    onToggleWishlist={onToggleWishlist}
                    wishlist={wishlist}
                />
            ))}
        </>
    );
}

function FeaturedZoneItem({ zone, onProductClick, onToggleWishlist, wishlist }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const handleScroll = () => {
        const container = scrollRef.current;
        if (container) {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        const container = scrollRef.current;
        if (container) {
            const cardWidth = 320;
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => (item.id === productId || item === productId));
    };

    const handleWishlistClick = (e, product) => {
        e.stopPropagation();
        if (onToggleWishlist) {
            onToggleWishlist(product);
        }
    };

    if (!zone.products || zone.products.length === 0) return null;

    return (
        <section className="featured-section" data-position={zone.position}>
            <div className="featured-header">
                <h2 className="featured-title">{zone.name}</h2>
            </div>

            <div className="featured-carousel-container">
                <button
                    className={`carousel-arrow carousel-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
                    onClick={() => scroll('left')}
                    disabled={!canScrollLeft}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>

                <div
                    className="featured-carousel"
                    ref={scrollRef}
                    onScroll={handleScroll}
                    style={{
                        '--grid-columns': zone.gridConfig?.columns || 4,
                        '--grid-gap': `${zone.gridConfig?.gap || 16}px`
                    }}
                >
                    {zone.products.map((item) => {
                        const product = item.product;
                        const image = item.customThumbnail || product?.image || '/placeholder.jpg';
                        const liked = isInWishlist(product?.id);

                        return (
                            <div
                                key={item.id}
                                className="featured-card"
                                onClick={() => onProductClick && onProductClick(product)}
                                style={{ '--aspect-ratio': zone.gridConfig?.aspectRatio || '3/4' }}
                            >
                                <div className="featured-image">
                                    <img src={image} alt={product?.name} loading="lazy" />
                                    <button
                                        className={`featured-like-btn ${liked ? 'liked' : ''}`}
                                        onClick={(e) => handleWishlistClick(e, product)}
                                    >
                                        <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="featured-info">
                                    <h3 className="featured-name">{product?.name}</h3>
                                    <p className="featured-price">{formatVND(product?.price || 0)}</p>
                                    <button className="featured-cta">MUA NGAY</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    className={`carousel-arrow carousel-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
                    onClick={() => scroll('right')}
                    disabled={!canScrollRight}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
            </div>
        </section>
    );
}
