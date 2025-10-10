const STRAPI_URL = 'http://localhost:1337';

async function fetchFromStrapi(endpoint, options = {}) {
    const url = `${STRAPI_URL}/api/${endpoint}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Strapi fetch error:', error);
        return null;
    }
}

// Specific API calls
async function getProducts() {
    return fetchFromStrapi('products?populate=*');
}

async function getProduct(id) {
    return fetchFromStrapi(`products/${id}?populate=*`);
}

async function getServices() {
    return fetchFromStrapi('services?populate=*');
}

async function getHomepage() {
    return fetchFromStrapi('homepage?populate=deep');
}

async function getMarketingBanner() {
    return fetchFromStrapi('marketing-banner');
}

async function getFooterContent() {
    return fetchFromStrapi('footer-content?populate=deep');
}

async function getContactInfo() {
    return fetchFromStrapi('contact-info');
}

// Helper to get image URL from Strapi
function getStrapiImageUrl(image) {
    if (!image) return '';
    const imageData = image.data || image;
    if (imageData.attributes?.url) {
        const url = imageData.attributes.url;
        return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    }
    return '';
}