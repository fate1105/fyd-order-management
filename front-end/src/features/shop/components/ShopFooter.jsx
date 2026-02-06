import { Link } from "react-router-dom";

export default function ShopFooter() {
  return (
    <footer className="shop-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>SẢN PHẨM</h4>
          <ul className="footer-links">
            <li><Link to="/shop?category=1">Áo</Link></li>
            <li><Link to="/shop?category=2">Quần</Link></li>
            <li><Link to="/shop?category=3">Giày</Link></li>
            <li><Link to="/shop?category=4">Phụ kiện</Link></li>
            <li><Link to="/shop?sale=true">Sale</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>HỖ TRỢ</h4>
          <ul className="footer-links">
            <li><Link to="/shop/info/buying-guide">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/shop/info/return-policy">Chính sách đổi trả</Link></li>
            <li><Link to="/shop/info/privacy-policy">Chính sách bảo mật</Link></li>
            <li><Link to="/shop/info/payment-methods">Phương thức thanh toán</Link></li>
            <li><Link to="/shop/info/faq">FAQ</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>VỀ FYD</h4>
          <ul className="footer-links">
            <li><Link to="/shop/info/about">Giới thiệu</Link></li>
            <li><Link to="/shop/info/contact">Liên hệ</Link></li>
            <li><Link to="/shop/info/stores">Hệ thống cửa hàng</Link></li>
            <li><Link to="/shop/info/recruitment">Tuyển dụng</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>THEO DÕI CHÚNG TÔI</h4>
          <ul className="footer-links">
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">TikTok</a></li>
            <li><a href="#">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 FYD Store. All rights reserved.</p>
        <div className="footer-social">
          <a href="#" title="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a href="#" title="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="#" title="TikTok">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
