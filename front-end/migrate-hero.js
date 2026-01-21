const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function createHeroZone() {
    const zone = {
        name: 'Hero Slides',
        slug: 'hero-slides',
        position: 'home_hero',
        isActive: true,
        gridConfig: {
            columns: 1,
            gap: 0,
            aspectRatio: '16/9'
        },
        products: [
            {
                productId: 42,
                sortOrder: 0,
                customThumbnail: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&q=80'
            },
            {
                productId: 40,
                sortOrder: 1,
                customThumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80'
            },
            {
                productId: 39,
                sortOrder: 2,
                customThumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80'
            }
        ]
    };

    try {
        const res = await fetch('http://localhost:8080/api/featured-zones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(zone)
        });

        if (res.ok) {
            console.log('Successfully created Hero Slides zone!');
            const data = await res.json();
            console.log(JSON.stringify(data, null, 2));
        } else {
            const err = await res.text();
            console.error('Failed to create zone:', res.status, err);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

createHeroZone();
