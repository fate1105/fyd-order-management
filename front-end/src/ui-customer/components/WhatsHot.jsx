export default function WhatsHotSection({ onNavigate }) {
  const hotItems = [
    {
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
      title: "Streetwear Collection",
      description: "Khám phá bộ sưu tập streetwear mới nhất. Phong cách đường phố, cá tính riêng.",
      cta: "MUA NGAY",
      filter: { type: 'all' }
    },
    {
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
      title: "Áo Thun Basic",
      description: "Chất liệu cotton cao cấp, thoáng mát cho mọi hoạt động hàng ngày.",
      cta: "MUA NGAY",
      filter: { type: 'category', id: 10 }
    },
    {
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
      title: "Quần Jean Nam",
      description: "Denim chất lượng, form dáng chuẩn, phù hợp mọi phong cách.",
      cta: "MUA NGAY",
      filter: { type: 'category', id: 20 }
    },
    {
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
      title: "Áo Khoác Mùa Đông",
      description: "Giữ ấm tối đa với thiết kế thời trang, chống gió hiệu quả.",
      cta: "MUA NGAY",
      filter: { type: 'category', id: 14 }
    }
  ];

  const handleClick = (item) => {
    if (onNavigate) {
      onNavigate(item.filter);
    }
    // Scroll to products section
    document.querySelector('.shop-main')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="whats-hot-section">
      <div className="whats-hot-container">
        <h2 className="whats-hot-title">WHAT'S HOT</h2>
        <div className="whats-hot-grid">
          {hotItems.map((item, index) => (
            <div key={index} className="hot-card" onClick={() => handleClick(item)}>
              <div className="hot-card-image">
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
              <div className="hot-card-content">
                <h3 className="hot-card-title">{item.title}</h3>
                <p className="hot-card-desc">{item.description}</p>
                <button className="hot-card-cta">{item.cta}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
