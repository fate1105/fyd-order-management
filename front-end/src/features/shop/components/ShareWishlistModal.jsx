import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '@shared/utils/api.js';
import './ShareWishlistModal.css';

export default function ShareWishlistModal({ open, productIds, onClose }) {
    const { t } = useTranslation();
    const [ownerName, setOwnerName] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    if (!open) return null;

    const handleGenerateLink = async () => {
        if (!productIds || productIds.length === 0) {
            setError(t('shop.share_empty_error', 'Please add products to your wishlist first'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${BASE_URL}/api/wishlist/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productIds: productIds,
                    ownerName: ownerName || null
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create share link');
            }

            const data = await response.json();
            setShareUrl(data.shareUrl);
        } catch (err) {
            setError(t('shop.share_error', 'Failed to generate share link. Please try again.'));
            console.error('Share error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleShareFacebook = () => {
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
    };

    const handleShareTwitter = () => {
        const text = encodeURIComponent(t('shop.share_twitter_text', 'Check out my wishlist!'));
        const url = encodeURIComponent(shareUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(`${t('shop.share_whatsapp_text', 'Check out my wishlist!')} ${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleClose = () => {
        setShareUrl('');
        setOwnerName('');
        setError('');
        setCopied(false);
        onClose();
    };

    return (
        <>
            <div className="share-modal-backdrop" onClick={handleClose} />
            <div className="share-modal">
                <div className="share-modal-header">
                    <h3>{t('shop.share_wishlist', 'Share Wishlist')}</h3>
                    <button className="share-modal-close" onClick={handleClose}>×</button>
                </div>

                <div className="share-modal-content">
                    {!shareUrl ? (
                        <>
                            <p className="share-modal-desc">
                                {t('shop.share_desc', 'Generate a link to share your wishlist with friends and family.')}
                            </p>

                            <div className="share-input-group">
                                <label>{t('shop.your_name', 'Your Name (optional)')}</label>
                                <input
                                    type="text"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    placeholder={t('shop.name_placeholder', 'Enter your name')}
                                />
                            </div>

                            <p className="share-product-count">
                                {t('shop.share_products_count', '{{count}} products in wishlist', { count: productIds?.length || 0 })}
                            </p>

                            {error && <p className="share-error">{error}</p>}

                            <button
                                className="share-generate-btn"
                                onClick={handleGenerateLink}
                                disabled={loading}
                            >
                                {loading ? t('common.loading', 'Loading...') : t('shop.generate_link', 'Generate Share Link')}
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="share-modal-desc share-success">
                                {t('shop.share_ready', 'Your wishlist link is ready!')}
                            </p>

                            <div className="share-url-box">
                                <input type="text" value={shareUrl} readOnly />
                                <button className="copy-btn" onClick={handleCopyLink}>
                                    {copied ? t('shop.copied', 'Copied!') : t('shop.copy', 'Copy')}
                                </button>
                            </div>

                            <div className="share-social-buttons">
                                <button className="social-btn facebook" onClick={handleShareFacebook}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </button>
                                <button className="social-btn twitter" onClick={handleShareTwitter}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    Twitter
                                </button>
                                <button className="social-btn whatsapp" onClick={handleShareWhatsApp}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp
                                </button>
                            </div>

                            <button className="share-new-link" onClick={() => setShareUrl('')}>
                                {t('shop.create_new_link', 'Create New Link')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
