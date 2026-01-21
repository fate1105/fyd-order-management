import { useState, useEffect, useRef } from "react";

export default function SortDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const options = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'bestseller', label: 'Bán chạy nhất' },
    { value: 'price-asc', label: 'Giá: Thấp đến Cao' },
    { value: 'price-desc', label: 'Giá: Cao đến Thấp' },
    { value: 'name-asc', label: 'Tên A-Z' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = options.find(o => o.value === value)?.label || 'Sắp xếp';

  return (
    <div className="sort-dropdown" ref={ref}>
      <button 
        className="sort-btn" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>SẮp xếp: {currentLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {isOpen && (
        <div className="sort-dropdown-menu">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`sort-option ${value === opt.value ? 'active' : ''}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
