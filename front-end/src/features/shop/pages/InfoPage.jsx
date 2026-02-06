import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ShopHeader from "../components/ShopHeader.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import { INFO_CONTENT } from "./info-content.js";
import { useCart } from "@shared/context/CartContext";
import "../styles/info-pages.css";

// Shared state/utils from Shop (if possible, otherwise duplicate necessary parts)
import { getCustomer, logout as customerLogout } from "@shared/utils/customerSession.js";
import { fetchCategories } from "@shared/utils/api.js";

export default function InfoPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [customer, setCustomer] = useState(null);
    const { cartCount } = useCart();

    const content = INFO_CONTENT[slug];

    useEffect(() => {
        // Load customer
        setCustomer(getCustomer());

        // Load categories for header
        fetchCategories().then(setCategories);
    }, []);

    if (!content) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <h2>Không tìm thấy trang</h2>
                <button onClick={() => navigate('/shop')}>Quay lại cửa hàng</button>
            </div>
        );
    }

    return (
        <div className="info-page-container">
            <ShopHeader
                categories={categories}
                customer={customer}
                cartCount={cartCount}
                onLoginClick={() => navigate('/shop')} // Redirect back to shop to open login or handle here
                onLogoutClick={() => { customerLogout(); setCustomer(null); }}
                onSelectCategory={(id, type) => navigate(`/shop?${type === 'parent' ? 'parentCategory' : 'category'}=${id}`)}
                onShowSale={() => navigate('/shop?sale=true')}
                onShowAll={() => navigate('/shop')}
                searchValue=""
                onSearchChange={() => { }}
            />

            <div className="info-hero">
                <h1>{content.title}</h1>
                <p>{content.subtitle}</p>
            </div>

            <div className="info-content-wrapper">
                {content.sections.map((section, idx) => (
                    <div key={idx} className="info-section">
                        <h2>{section.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />
                    </div>
                ))}

                {content.cards && (
                    <div className="contact-grid">
                        {content.cards.map((card, idx) => (
                            <div key={idx} className="contact-card">
                                <h3>{card.title}</h3>
                                <p>{card.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ShopFooter />
        </div>
    );
}
