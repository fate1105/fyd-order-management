import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ai-chat.css";
import { aiAPI } from "@shared/utils/api.js";
import { getCustomerData } from "@shared/utils/customerSession.js";

// SVG Icons
const BotIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A1.5 1.5 0 006 14.5 1.5 1.5 0 007.5 16 1.5 1.5 0 009 14.5 1.5 1.5 0 007.5 13m9 0a1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5 1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5M12 9a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z" />
    </svg>
);

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
    </svg>
);

const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);

const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        <circle cx="12" cy="10" r="1.5" />
        <circle cx="8" cy="10" r="1.5" />
        <circle cx="16" cy="10" r="1.5" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const WaveIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A1.5 1.5 0 006 14.5 1.5 1.5 0 007.5 16 1.5 1.5 0 009 14.5 1.5 1.5 0 007.5 13m9 0a1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5 1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5M12 9a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z" />
    </svg>
);

export default function AiChatBubble() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Function to render message with product cards
    const renderMessageContent = (content) => {
        // Regex to match product tags: PRODUCT[ID|Name|Price|ImageURL]
        // Make ImageURL optional in case it gets cut off
        const productRegex = /PRODUCT\[(\d+)\|([^|]+)\|(\d+)(?:\|([^\]]+))?\]/g;
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
            const productImage = match[4] || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect fill="%23f0f0f0" width="60" height="60"/><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';

            // Add product card - Premium Design
            parts.push(
                <div
                    key={`product-${productId}-${match.index}`}
                    onClick={() => {
                        // Navigate directly to product detail page
                        navigate(`/shop/product/${productId}`);
                        setIsOpen(false);
                    }}
                    className="ai-product-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        margin: '10px 0',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        e.currentTarget.style.borderColor = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                    }}
                >
                    {/* Product Image */}
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        background: '#f0f0f0'
                    }}>
                        <img
                            src={productImage}
                            alt={productName}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70"><rect fill="%23f5f5f5" width="70" height="70"/><text x="50%" y="50%" font-size="10" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                            }}
                        />
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: '700',
                            fontSize: '14px',
                            color: '#1a1a1a',
                            marginBottom: '6px',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {productName}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                fontSize: '15px',
                                color: '#000',
                                fontWeight: '800',
                                letterSpacing: '-0.3px'
                            }}>
                                {new Intl.NumberFormat('vi-VN').format(productPrice)}₫
                            </span>
                        </div>
                    </div>

                    {/* Arrow Icon */}
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'transform 0.2s'
                    }}>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="2.5"
                        >
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </div>
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            // Get customer ID for personalized responses
            const customer = getCustomerData();
            const customerId = customer?.id || null;

            const response = await aiAPI.shopChat(userMessage, customerId);
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
                        content: response.error || "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Xin lỗi, không thể kết nối. Vui lòng thử lại sau.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (text) => {
        setInputValue(text);
    };

    const quickActions = [
        "Có gì mới không?",
        "Áo thun size M",
        "Sản phẩm bán chạy",
        "Giá dưới 500k",
    ];

    return (
        <>
            {/* Chat Panel */}
            {isOpen && (
                <div className="ai-chat-panel">
                    {/* Header */}
                    <div className="ai-chat-header">
                        <div className="ai-chat-header-left">
                            <div className="ai-chat-avatar">
                                <BotIcon />
                            </div>
                            <div className="ai-chat-header-info">
                                <h3>FYD AI ASSISTANT</h3>
                                <div className="ai-chat-status">
                                    <p>Đang hoạt động</p>
                                </div>
                            </div>
                        </div>
                        <button
                            className="ai-chat-minimize"
                            onClick={() => setIsOpen(false)}
                            type="button"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="ai-chat-messages">
                        {messages.length === 0 && (
                            <div className="ai-welcome">
                                <div className="ai-welcome-icon">
                                    <WaveIcon />
                                </div>
                                <h4>Xin chào!</h4>
                                <p>
                                    Tôi là trợ lý AI của FYD. Hãy hỏi tôi về sản phẩm, size, màu
                                    sắc hoặc bất cứ điều gì bạn cần!
                                </p>
                                <div className="ai-quick-actions">
                                    {quickActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            className="ai-quick-action"
                                            onClick={() => handleQuickAction(action)}
                                            type="button"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message ${msg.role}`}>
                                <div className="ai-message-avatar">
                                    {msg.role === "assistant" ? <BotIcon /> : <UserIcon />}
                                </div>
                                <div className="ai-message-content">
                                    {msg.role === "assistant"
                                        ? renderMessageContent(msg.content)
                                        : msg.content
                                    }
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="ai-typing">
                                <div className="ai-typing-avatar">
                                    <BotIcon />
                                </div>
                                <div className="ai-typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="ai-chat-input-container">
                        <div className="ai-chat-input-wrapper">
                            <input
                                type="text"
                                className="ai-chat-input"
                                placeholder="Nhập tin nhắn..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                            <button
                                className="ai-chat-send"
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                type="button"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                className={`ai-chat-button ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                aria-label={isOpen ? "Đóng chat" : "Mở chat AI"}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>
        </>
    );
}
