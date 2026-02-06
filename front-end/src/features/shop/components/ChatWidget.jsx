import { useState, useRef, useEffect } from "react";
import { getCustomerSession } from "@shared/utils/customerSession.js";
import "./ChatWidget.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * AI Chat Widget component - floating chat bubble for customer support.
 * Provides AI-powered responses to customer questions about products and orders.
 */
export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Xin chào! Tôi là trợ lý AI của FYD. Tôi có thể giúp bạn tìm kiếm sản phẩm, kiểm tra đơn hàng, hoặc trả lời các câu hỏi. Bạn cần hỗ trợ gì?"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    async function handleSend() {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const session = getCustomerSession();
            const customerId = session?.customer?.id;

            const res = await fetch(`${API_BASE}/api/ai/chat/shop`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    customerId: customerId || null
                }),
            });

            if (!res.ok) throw new Error("Failed to get response");

            const data = await res.json();
            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.response || "Xin lỗi, tôi không thể xử lý yêu cầu này."
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau."
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyPress(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    // Quick actions
    const quickActions = [
        { label: "🔍 Tìm sản phẩm", query: "Tôi muốn tìm sản phẩm" },
        { label: "📦 Tra cứu đơn hàng", query: "Kiểm tra tình trạng đơn hàng" },
        { label: "💰 Khuyến mãi", query: "Có khuyến mãi gì không?" },
        { label: "🚚 Phí vận chuyển", query: "Phí vận chuyển bao nhiêu?" },
    ];

    function handleQuickAction(query) {
        setInput(query);
        inputRef.current?.focus();
    }

    return (
        <>
            {/* Chat Bubble Button */}
            <button
                className={`chat-widget-bubble ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chat với trợ lý AI"
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chat-widget-panel">
                    <div className="chat-widget-header">
                        <div className="chat-widget-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2z" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1="9" y1="9" x2="9.01" y2="9" />
                                <line x1="15" y1="9" x2="15.01" y2="9" />
                            </svg>
                        </div>
                        <div className="chat-widget-title">
                            <span>Trợ lý AI FYD</span>
                            <span className="chat-widget-status">● Online</span>
                        </div>
                        <button className="chat-widget-close" onClick={() => setIsOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="chat-widget-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.role}`}>
                                {msg.role === "assistant" && (
                                    <div className="message-avatar">AI</div>
                                )}
                                <div className="message-content">{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message assistant">
                                <div className="message-avatar">AI</div>
                                <div className="message-content typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 1 && (
                        <div className="chat-quick-actions">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    className="quick-action-btn"
                                    onClick={() => handleQuickAction(action.query)}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="chat-widget-input">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            disabled={loading}
                        />
                        <button
                            className="send-btn"
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
