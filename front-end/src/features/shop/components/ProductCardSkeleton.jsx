import SkeletonLoader from "@shared/components/SkeletonLoader";

export default function ProductCardSkeleton() {
    return (
        <div className="product-card skeleton-card">
            <div className="product-image-wrapper">
                <SkeletonLoader.Rect style={{ aspectRatio: '1/1', width: '100%' }} />
            </div>
            <div className="product-info" style={{ padding: '15px' }}>
                <SkeletonLoader.Text className="short" style={{ marginBottom: '10px' }} />
                <SkeletonLoader.Title style={{ width: '90%', height: '1.2rem', marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <SkeletonLoader.Text style={{ width: '60px', height: '1.4rem' }} />
                    <SkeletonLoader.Text style={{ width: '40px', height: '1rem' }} />
                </div>
            </div>
        </div>
    );
}
