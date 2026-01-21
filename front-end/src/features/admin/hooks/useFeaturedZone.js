import { useState, useEffect, useCallback } from 'react';
import { featuredAPI } from '@shared/utils/api.js';

// Default grid config
const DEFAULT_GRID_CONFIG = {
    columns: 4,
    gap: 16,
    aspectRatio: '3/4'
};

// Create new zone template
export function createNewZone() {
    return {
        id: null,
        name: '',
        slug: '',
        position: 'home_hero',
        isActive: true,
        gridConfig: { ...DEFAULT_GRID_CONFIG },
        products: []
    };
}

export function useFeaturedZones() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadZones = useCallback(async () => {
        setLoading(true);
        try {
            const data = await featuredAPI.getZones();
            setZones(data || []);
        } catch (error) {
            console.error('Failed to load zones:', error);
            setZones([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadZones();
    }, [loadZones]);

    const createZone = useCallback(async (zone) => {
        try {
            const created = await featuredAPI.createZone(zone);
            setZones(prev => [...prev, created]);
            return created;
        } catch (error) {
            console.error('Failed to create zone:', error);
            throw error;
        }
    }, []);

    const deleteZone = useCallback(async (id) => {
        try {
            await featuredAPI.deleteZone(id);
            setZones(prev => prev.filter(z => z.id !== id));
        } catch (error) {
            console.error('Failed to delete zone:', error);
            throw error;
        }
    }, []);

    const toggleZone = useCallback(async (id) => {
        try {
            const zone = zones.find(z => z.id === id);
            if (!zone) return;

            const updated = await featuredAPI.updateZone(id, { isActive: !zone.isActive });
            setZones(prev => prev.map(z => z.id === id ? updated : z));
        } catch (error) {
            console.error('Failed to toggle zone:', error);
            throw error;
        }
    }, [zones]);

    return {
        zones,
        loading,
        loadZones,
        createZone,
        deleteZone,
        toggleZone
    };
}

export function useFeaturedZone(zoneId) {
    const [zone, setZone] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load zone
    useEffect(() => {
        async function loadZone() {
            if (!zoneId || zoneId === 'new') {
                setZone(createNewZone());
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await featuredAPI.getZone(zoneId);
                setZone(data);
            } catch (error) {
                console.error('Failed to load zone:', error);
                setZone(null);
            }
            setLoading(false);
        }
        loadZone();
    }, [zoneId]);

    // Update grid config
    const updateGridConfig = useCallback((config) => {
        setZone(prev => ({
            ...prev,
            gridConfig: { ...prev.gridConfig, ...config }
        }));
        setHasChanges(true);
    }, []);

    // Update zone info
    const updateZoneInfo = useCallback((updates) => {
        setZone(prev => ({ ...prev, ...updates }));
        setHasChanges(true);
    }, []);

    // Reorder products (drag-drop)
    const reorderProducts = useCallback((fromIndex, toIndex) => {
        setZone(prev => {
            const products = [...prev.products];
            const [moved] = products.splice(fromIndex, 1);
            products.splice(toIndex, 0, moved);

            // Update positions
            const updated = products.map((p, i) => ({ ...p, position: i }));
            return { ...prev, products: updated };
        });
        setHasChanges(true);
    }, []);

    // Set all products (for mass updates)
    const setProducts = useCallback((newProducts) => {
        setZone(prev => ({
            ...prev,
            products: newProducts.map((p, i) => ({ ...p, position: i }))
        }));
        setHasChanges(true);
    }, []);

    // Add product
    const addProduct = useCallback((product) => {
        setZone(prev => {
            // Check if already exists
            if (prev.products.some(p => p.productId === product.id)) {
                return prev;
            }

            const newProduct = {
                id: `temp-${Date.now()}`,
                productId: product.id,
                position: prev.products.length,
                customThumbnail: null,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.salePrice || product.basePrice,
                    image: product.thumbnail || product.images?.[0]?.imageUrl || '/placeholder.jpg'
                }
            };

            return { ...prev, products: [...prev.products, newProduct] };
        });
        setHasChanges(true);
    }, []);

    // Remove product
    const removeProduct = useCallback((productId) => {
        setZone(prev => ({
            ...prev,
            products: prev.products
                .filter(p => p.id !== productId)
                .map((p, i) => ({ ...p, position: i }))
        }));
        setHasChanges(true);
    }, []);

    // Update thumbnail
    const updateThumbnail = useCallback((productId, imageUrl) => {
        setZone(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === productId ? { ...p, customThumbnail: imageUrl } : p
            )
        }));
        setHasChanges(true);
    }, []);

    // Toggle active
    const toggleActive = useCallback(() => {
        setZone(prev => ({ ...prev, isActive: !prev.isActive }));
        setHasChanges(true);
    }, []);

    // Save zone
    const saveZone = useCallback(async () => {
        if (!zone) return;

        setSaving(true);
        try {
            const payload = {
                name: zone.name,
                slug: zone.slug,
                position: zone.position,
                isActive: zone.isActive,
                gridConfig: zone.gridConfig,
                productIds: zone.products.map(p => ({
                    productId: p.productId,
                    position: p.position,
                    customThumbnail: p.customThumbnail
                }))
            };

            let saved;
            if (zone.id) {
                saved = await featuredAPI.updateZone(zone.id, payload);
            } else {
                saved = await featuredAPI.createZone(payload);
            }

            setZone(saved);
            setHasChanges(false);
            return saved;
        } catch (error) {
            console.error('Failed to save zone:', error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [zone]);

    // Delete zone
    const deleteZone = useCallback(async () => {
        if (!zone?.id) return;
        setSaving(true);
        try {
            await featuredAPI.deleteZone(zone.id);
            return true;
        } catch (error) {
            console.error('Failed to delete zone:', error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [zone]);

    return {
        zone,
        loading,
        saving,
        hasChanges,
        updateGridConfig,
        updateZoneInfo,
        reorderProducts,
        addProduct,
        removeProduct,
        setProducts,
        updateThumbnail,
        toggleActive,
        saveZone,
        deleteZone
    };
}

export default useFeaturedZone;
