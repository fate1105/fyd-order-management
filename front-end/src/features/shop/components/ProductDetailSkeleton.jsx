import SkeletonLoader from "@shared/components/SkeletonLoader";

export default function ProductDetailSkeleton() {
    return (
        <main className="product-detail-main">
            <nav className="product-breadcrumbs">
                <SkeletonLoader.Text style={{ width: '200px' }} />
            </nav>

            <div className="product-detail-hero">
                <div className="product-gallery">
                    <div className="gallery-thumbnails">
                        {[...Array(4)].map((_, i) => (
                            <SkeletonLoader.Rect key={i} className="thumbnail" style={{ width: '80px', height: '80px', marginBottom: '10px' }} />
                        ))}
                    </div>
                    <div className="gallery-main">
                        <SkeletonLoader.Rect style={{ aspectRatio: '1/1', width: '100%' }} />
                    </div>
                </div>

                <div className="product-info-panel">
                    <div className="product-info-sticky">
                        <SkeletonLoader.Title style={{ width: '80%', height: '2.5rem' }} />
                        <SkeletonLoader.Text style={{ width: '150px' }} />

                        <div className="product-price-section" style={{ margin: '30px 0' }}>
                            <SkeletonLoader.Text style={{ width: '120px', height: '2rem' }} />
                        </div>

                        <div className="color-selector" style={{ marginBottom: '25px' }}>
                            <SkeletonLoader.Text className="short" />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[...Array(3)].map((_, i) => (
                                    <SkeletonLoader.Circle key={i} style={{ width: '36px', height: '36px' }} />
                                ))}
                            </div>
                        </div>

                        <div className="size-selector" style={{ marginBottom: '30px' }}>
                            <SkeletonLoader.Text className="short" />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[...Array(4)].map((_, i) => (
                                    <SkeletonLoader.Rect key={i} style={{ width: '60px', height: '40px' }} />
                                ))}
                            </div>
                        </div>

                        <SkeletonLoader.Rect style={{ width: '100%', height: '56px', borderRadius: '8px' }} />
                    </div>
                </div>
            </div>
        </main>
    );
}
