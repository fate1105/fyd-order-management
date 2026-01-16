import { useState, useEffect } from "react";

export default function HeroBanner({ onExploreClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&q=80",
      title: "BỘ SƯU TẬP MỚI",
      subtitle: "STREETWEAR 2026",
      cta: "MUA NGAY",
      dark: true
    },
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
      title: "GIẢM ĐẾN 50%",
      subtitle: "SALE CUỐI MÙA",
      cta: "XEM NGAY",
      dark: false
    },
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
      title: "PHONG CÁCH MỚI",
      subtitle: "THỜI TRANG ĐƯỜNG PHỐ",
      cta: "KHÁM PHÁ",
      dark: true
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleCtaClick = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      // Default: scroll to products section
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-banner">
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`hero-slide ${index === currentSlide ? 'active' : ''} ${slide.dark ? 'dark' : 'light'}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-content">
            <span className="hero-subtitle">{slide.subtitle}</span>
            <h1 className="hero-title">{slide.title}</h1>
            <button className="hero-cta" onClick={handleCtaClick}>{slide.cta}</button>
          </div>
        </div>
      ))}
      <div className="hero-dots">
        {slides.map((_, index) => (
          <button 
            key={index}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
