import "../styles/skeleton.css";

/**
 * SkeletonLoader Component
 * @param {string} type - 'text', 'title', 'circle', 'rect'
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles for custom dimensions
 */
export default function SkeletonLoader({ type = "text", className = "", style = {} }) {
    const baseClass = "skeleton";
    const typeClass = `skeleton-${type}`;

    return (
        <div
            className={`${baseClass} ${typeClass} ${className}`}
            style={style}
        />
    );
}

// Sub-components for easier usage
SkeletonLoader.Text = (props) => <SkeletonLoader type="text" {...props} />;
SkeletonLoader.Title = (props) => <SkeletonLoader type="title" {...props} />;
SkeletonLoader.Circle = (props) => <SkeletonLoader type="circle" {...props} />;
SkeletonLoader.Rect = (props) => <SkeletonLoader type="rect" {...props} />;
