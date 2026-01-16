export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages <= 7) {
        pages.push(i);
      } else if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="pagination">
      <button 
        className="pagination-btn prev"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        ← Trước
      </button>
      <div className="pagination-pages">
        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`dots-${idx}`} className="pagination-dots">...</span>
          ) : (
            <button
              key={page}
              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        ))}
      </div>
      <button 
        className="pagination-btn next"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Sau →
      </button>
    </div>
  );
}
