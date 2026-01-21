import { useState } from "react";

export default function FilterSidebar({ 
  categories, 
  colors, 
  sizes, 
  selectedCategory,
  selectedParentCategory,
  selectedColors, 
  selectedSizes, 
  priceRange,
  onCategoryChange, 
  onColorToggle, 
  onSizeToggle,
  onPriceChange,
  onClearFilters,
  showSaleOnly
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    color: true,
    size: true,
    price: true
  });
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategoryExpand = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const hasFilters = selectedCategory || selectedParentCategory || selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000000 || showSaleOnly;
  const parentCategories = categories.filter(c => !c.parentId);

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>BỘ LỌC</h3>
        {hasFilters && (
          <button className="clear-filters" onClick={onClearFilters}>Xóa tất cả</button>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('category')}>
          <span>Danh mục</span>
          <span className={`filter-arrow ${expandedSections.category ? 'open' : ''}`}>▼</span>
        </button>
        {expandedSections.category && (
          <div className="filter-categories">
            <button 
              className={`category-item ${!selectedCategory && !selectedParentCategory ? 'active' : ''}`}
              onClick={() => onCategoryChange(null, null)}
            >
              Tất cả sản phẩm
            </button>
            {parentCategories.map(parent => (
              <div key={parent.id} className="category-group">
                <div className="category-parent-row">
                  <button 
                    className={`category-item parent ${selectedParentCategory === parent.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(null, parent.id)}
                  >
                    {parent.name}
                  </button>
                  {parent.children?.length > 0 && (
                    <button className="category-expand" onClick={() => toggleCategoryExpand(parent.id)}>
                      {expandedCategories[parent.id] ? '−' : '+'}
                    </button>
                  )}
                </div>
                {expandedCategories[parent.id] && parent.children && (
                  <div className="category-children">
                    {parent.children.map(child => (
                      <button 
                        key={child.id}
                        className={`category-item child ${selectedCategory === child.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(child.id, parent.id)}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Color Filter */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('color')}>
          <span>Màu sắc</span>
          <span className={`filter-arrow ${expandedSections.color ? 'open' : ''}`}>▼</span>
        </button>
        {expandedSections.color && (
          <div className="filter-colors">
            {colors.map(color => (
              <button
                key={color.id}
                className={`color-swatch ${selectedColors.includes(color.id) ? 'selected' : ''}`}
                style={{ backgroundColor: color.hexCode || '#ccc' }}
                title={color.name}
                onClick={() => onColorToggle(color.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Size Filter */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('size')}>
          <span>Kích cỡ</span>
          <span className={`filter-arrow ${expandedSections.size ? 'open' : ''}`}>▼</span>
        </button>
        {expandedSections.size && (
          <div className="filter-sizes">
            {sizes.map(size => (
              <button
                key={size.id}
                className={`size-btn ${selectedSizes.includes(size.id) ? 'selected' : ''}`}
                onClick={() => onSizeToggle(size.id)}
              >
                {size.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="filter-section">
        <button className="filter-section-header" onClick={() => toggleSection('price')}>
          <span>Giá</span>
          <span className={`filter-arrow ${expandedSections.price ? 'open' : ''}`}>▼</span>
        </button>
        {expandedSections.price && (
          <div className="filter-price">
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Từ" 
                value={priceRange[0] || ''}
                onChange={(e) => onPriceChange([Number(e.target.value) || 0, priceRange[1]])}
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Đến" 
                value={priceRange[1] === 5000000 ? '' : priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value) || 5000000])}
              />
            </div>
            <div className="price-presets">
              <button onClick={() => onPriceChange([0, 200000])}>Dưới 200K</button>
              <button onClick={() => onPriceChange([200000, 500000])}>200K - 500K</button>
              <button onClick={() => onPriceChange([500000, 1000000])}>500K - 1M</button>
              <button onClick={() => onPriceChange([1000000, 5000000])}>Trên 1M</button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
