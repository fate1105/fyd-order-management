import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ai-chat.css";
import { aiAPI } from "@shared/utils/api.js";

export default function AdminAiSummary({ compact = false }) {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Function to render message with product cards (similar to Shop AI Chat)
    const renderMessageContent = (content) => {
        if (!content || typeof content !== 'string') return content;

        // Regex to match product tags: PRODUCT[ID|Name|Price|ImageURL] (SKU: xxx, còn y)
        // Also captures optional trailing SKU/stock info
        const productRegex = /PRODUCT\[(\d+)\|([^|]+)\|(\d+)\|([^\]]*)\](?:\s*\(SKU:\s*([^,]+),\s*còn\s*(\d+)\))?/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = productRegex.exec(content)) !== null) {
            // Add text before the product card
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {content.substring(lastIndex, match.index)}
                    </span>
                );
            }

            // Extract product info
            const productId = match[1];
            const productName = match[2];
            const productPrice = match[3];
            const productImage = match[4] || null;
            const sku = match[5] || null;  // Captured SKU
            const stock = match[6] || null;  // Captured stock

            // Add product card - Admin Premium Dark Theme
            parts.push(
                <div
                    key={`product-${productId}-${match.index}`}
                    onClick={() => navigate(`/admin/products`)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        margin: '8px 0',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        boxSizing: 'border-box',
                        clear: 'both' // Force new line
                    }}
                    className="admin-ai-product-card"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {/* Product Image */}
                    {productImage && (
                        <img
                            src={productImage}
                            alt={productName}
                            style={{
                                width: '44px',
                                height: '44px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                flexShrink: 0,
                                background: 'rgba(255,255,255,0.1)'
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}

                    {/* Product Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: '700',
                            fontSize: '13px',
                            color: '#fff',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {productName}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#4ade80',
                            fontWeight: '600',
                            marginBottom: stock ? '2px' : '0'
                        }}>
                            {new Intl.NumberFormat('vi-VN').format(productPrice)}₫
                        </div>
                        {stock && (
                            <div style={{
                                fontSize: '10px',
                                color: parseInt(stock) <= 2 ? '#f87171' : parseInt(stock) <= 5 ? '#fbbf24' : '#94a3b8',
                                fontWeight: '500'
                            }}>
                                Còn {stock} sp
                            </div>
                        )}
                    </div>

                    {/* Arrow Icon */}
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="2"
                        style={{ flexShrink: 0 }}
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < content.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {content.substring(lastIndex)}
                </span>
            );
        }

        return parts.length > 0 ? parts : content;
    };

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const data = await aiAPI.getAdminSummary();
            setSummary(data);
        } catch (error) {
            console.error("Failed to load AI summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, chatLoading]);

    const handleSend = async () => {
        if (!inputValue.trim() || chatLoading) return;

        const userMessage = inputValue.trim();
        setInputValue("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setChatLoading(true);

        try {
            const response = await aiAPI.adminChat(userMessage);
            if (response.success) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: response.reply },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: response.error || "Xin lỗi, có lỗi xảy ra.",
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Không thể kết nối. Vui lòng thử lại." },
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <div className={`ai-summary-card ${compact ? 'compact' : ''}`}>
                <div className="ai-summary-loading">
                    <div className="spinner"></div>
                    <p>Đang phân tích...</p>
                </div>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    return (
        <div className={`ai-summary-card ${compact ? 'compact' : ''}`}>
            {/* Header */}
            <div className="ai-summary-header">
                <div className="ai-summary-header-left">
                    <div className="ai-summary-icon">🤖</div>
                    <div>
                        <h3>AI ASSISTANT</h3>
                        <p>Gemini AI</p>
                    </div>
                </div>
                <span className="ai-summary-badge">LIVE</span>
            </div>

            {/* Summary Text - Compact */}
            <div className="ai-summary-content">
                <p className="ai-summary-text">{summary.summaryText}</p>
            </div>

            {/* Inventory Alerts - Keep these */}
            {summary.inventoryAlerts && summary.inventoryAlerts.length > 0 && (
                <div className="ai-alerts">
                    {summary.inventoryAlerts.slice(0, 3).map((alert, idx) => (
                        <div key={idx} className="ai-alert-item">
                            <span className="ai-alert-icon">⚠️</span>
                            <span>{alert}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Chat - Always visible in compact mode */}
            <div className="admin-ai-chat always-open">
                <div className="admin-ai-chat-header-mini">
                    <h4>💬 Hỏi AI</h4>
                </div>

                <div className="admin-ai-messages">
                    {messages.length === 0 && (
                        <div className="admin-ai-message assistant">
                            Hỏi tôi về doanh thu, tồn kho, hoặc gợi ý kinh doanh!
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`admin-ai-message ${msg.role}`}>
                            {msg.role === "assistant"
                                ? renderMessageContent(msg.content)
                                : msg.content}
                        </div>
                    ))}

                    {chatLoading && (
                        <div className="admin-ai-typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="admin-ai-input-container">
                    <input
                        type="text"
                        className="admin-ai-input"
                        placeholder="Nhập câu hỏi..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={chatLoading}
                    />
                    <button
                        className="admin-ai-send"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || chatLoading}
                        type="button"
                    >
                        ↑
                    </button>
                </div>
            </div>
        </div>
    );
}
