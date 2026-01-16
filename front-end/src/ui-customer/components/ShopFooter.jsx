export default function ShopFooter() {
  return (
    <footer className="shop-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>SẢN PHẨM</h4>
          <a href="#">Áo</a>
          <a href="#">Quần</a>
          <a href="#">Phụ kiện</a>
          <a href="#">Sale</a>
        </div>
        <div className="footer-section">
          <h4>HỖ TRỢ</h4>
          <a href="#">Hướng dẫn mua hàng</a>
          <a href="#">Chính sách đổi trả</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">FAQ</a>
        </div>
        <div className="footer-section">
          <h4>VỀ FYD</h4>
          <a href="#">Giới thiệu</a>
          <a href="#">Liên hệ</a>
          <a href="#">Tuyển dụng</a>
        </div>
        <div className="footer-section">
          <h4>THEO DÕI CHÚNG TÔI</h4>
          <div className="social-links">
            <a href="#" title="Facebook">FB</a>
            <a href="#" title="Instagram">IG</a>
            <a href="#" title="TikTok">TT</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 FYD Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
