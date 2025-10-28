const STRAPI_URL = 'https://strapi-backend-production-524c.up.railway.app';

async function fetchFromStrapi(endpoint) {
  const url = `${STRAPI_URL}/api/${endpoint}`;
  console.log('Fetching from:', url);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// ... rest of your API functions

// Specific API calls
export async function getProducts() {
    return fetchFromStrapi('products?populate=*');
}

export async function getProduct(id) {
    return fetchFromStrapi(`products/${id}?populate=*`);
}

export async function getServices() {
    return fetchFromStrapi('services?populate=*');
}

export async function getHomepage() {
    return fetchFromStrapi('homepage?populate=deep');
}

export async function getMarketingBanner() {
    return fetchFromStrapi('marketing-banner');
}

export async function getFooterContent() {
    return fetchFromStrapi('footer-content?populate=deep');
}

export async function getContactInfo() {
    return fetchFromStrapi('contact-info');
}

// Helper to get image URL from Strapi
export function getStrapiImageUrl(image) {
    if (!image) return '';
    const imageData = image.data || image;
    if (imageData.attributes?.url) {
        const url = imageData.attributes.url;
        return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    }
    return '';
}
