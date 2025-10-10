// products.js - Fixed version with better error handling

// Global variables
let currentPage = 1;
const pageSize = 6; // Products per page

const container = document.getElementById("products-container");
const paginationContainer = document.getElementById("pagination-container");
const STRAPI_URL = 'https://mobiletech-backend.onrender.com';

// Load products from Strapi with pagination
function loadProducts(page = 1) {
    currentPage = page;

    if (!container) {
        console.error("Products container not found!");
        return;
    }

    container.innerHTML = "<div class='flex justify-center items-center py-12'><div class='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div></div>";

    // FIXED: Added pagination parameters
    const apiUrl = `${STRAPI_URL}/api/products?populate=image&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    console.log("Fetching from:", apiUrl);

    fetch(apiUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Full API Response:", data);
            console.log("Products data:", data.data);

            container.innerHTML = ""; // Clear loading message

            if (!data.data || data.data.length === 0) {
                container.innerHTML = "<p class='text-center py-8 text-gray-600'>No products found!</p>";
                return;
            }

            // Create a wrapper for the grid
            const gridWrapper = document.createElement('div');
            gridWrapper.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

            // Render each product
            data.data.forEach((product, index) => {
                try {
                    // FIXED: Better validation
                    if (!product) {
                        console.warn(`Product at index ${index} is null/undefined`);
                        return;
                    }

                    // FIXED: Handle both Strapi response formats
                    // Some products have {attributes: {...}}, some have data directly
                    const attrs = product.attributes || product;

                    if (!attrs.name) {
                        console.warn(`Product at index ${index} has no name:`, product);
                        return;
                    }

                    console.log(`Processing product ${index}:`, attrs.name);

                    const name = attrs.name || "No Name";

                    // Handle description (rich text or plain text)
                    let description = "No Description";
                    try {
                        if (typeof attrs.description === "string") {
                            description = attrs.description;
                        } else if (attrs.description && Array.isArray(attrs.description)) {
                            if (attrs.description[0]?.children?.[0]?.text) {
                                description = attrs.description[0].children[0].text;
                            } else {
                                description = attrs.description.map(d => d.children?.[0]?.text || "").join(" ");
                            }
                        }
                    } catch (descError) {
                        console.warn("Error parsing description:", descError);
                    }

                    const price = attrs.price || 0;
                    const category = attrs.category || "Uncategorized";
                    const stock = attrs.stock !== undefined ? attrs.stock : 0;
                    const featured = attrs.featured || false;

                    // FIXED: Handle image URL correctly - support both formats
                    let imageUrl = "https://via.placeholder.com/400x300?text=No+Image";
                    try {
                        // Check if image is in attrs.image.data format (Strapi v4)
                        if (attrs.image && attrs.image.data) {
                            const imgData = Array.isArray(attrs.image.data)
                                ? attrs.image.data[0]
                                : attrs.image.data;

                            if (imgData?.attributes?.url) {
                                imageUrl = imgData.attributes.url.startsWith("http")
                                    ? imgData.attributes.url
                                    : `${STRAPI_URL}${imgData.attributes.url}`;
                            }
                        }
                        // Check if image is directly in attrs.image (flattened format)
                        else if (attrs.image && attrs.image.url) {
                            imageUrl = attrs.image.url.startsWith("http")
                                ? attrs.image.url
                                : `${STRAPI_URL}${attrs.image.url}`;
                        }
                        // Check if image is just a string URL
                        else if (typeof attrs.image === 'string') {
                            imageUrl = attrs.image.startsWith("http")
                                ? attrs.image
                                : `${STRAPI_URL}${attrs.image}`;
                        }

                        console.log(`Image URL for ${name}:`, imageUrl);
                    } catch (imgError) {
                        console.warn("Error parsing image:", imgError);
                    }

                    // Product card HTML
                    const productCard = `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <!-- Product Image -->
                        <div class="relative h-64 overflow-hidden bg-gray-100">
                            <img 
                                src="${imageUrl}" 
                                alt="${name}"
                                class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'"
                            />
                            ${featured ? '<span class="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Featured</span>' : ''}
                            ${stock === 0 ? '<span class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">Out of Stock</span>' : ''}
                        </div>
                        
                        <!-- Product Details -->
                        <div class="p-4">
                            ${category ? `<span class="text-xs text-blue-600 font-semibold uppercase">${category}</span>` : ''}
                            
                            <h3 class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                                ${name}
                            </h3>
                            
                            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}
                            </p>
                            
                            <!-- Price and Stock -->
                            <div class="mt-4 flex items-center justify-between">
                                <span class="text-2xl font-bold text-gray-900 dark:text-white">$${price.toFixed(2)}</span>
                                <button 
                                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                                    ${stock === 0 ? 'disabled' : ''}
                                    onclick="alert('Add to cart: ${name.replace(/'/g, "\\'")}')">
                                    ${stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                            
                            ${stock > 0 ? `<p class="mt-2 text-xs text-gray-500">${stock} in stock</p>` : ''}
                        </div>
                    </div>
                    `;

                    gridWrapper.insertAdjacentHTML("beforeend", productCard);
                } catch (productError) {
                    console.error(`Error rendering product at index ${index}:`, productError, product);
                }
            });

            container.appendChild(gridWrapper);

            // FIXED: Render pagination if meta exists
            if (data.meta && data.meta.pagination) {
                console.log("Pagination meta:", data.meta.pagination);
                renderPagination(data.meta.pagination.page, data.meta.pagination.pageCount);
            } else {
                console.warn("No pagination meta found in API response");
                if (paginationContainer) {
                    paginationContainer.innerHTML = "";
                }
            }
        })
        .catch(err => {
            console.error("Error fetching products:", err);
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600 font-semibold">Error loading products</p>
                    <p class="text-gray-600 text-sm mt-2">${err.message}</p>
                    <button onclick="loadProducts(${currentPage})" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Retry
                    </button>
                </div>
            `;
        });
}

// Render pagination buttons
function renderPagination(current, totalPages) {
    if (!paginationContainer) {
        console.warn("Pagination container not found");
        return;
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = ""; // Hide pagination if only 1 page
        return;
    }

    paginationContainer.innerHTML = `
    <nav class="flex justify-center mt-8" aria-label="Pagination">
        <ul class="inline-flex items-center -space-x-px">
            <!-- Previous Button -->
            <li>
                <button 
                    class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${current === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                    onclick="changePage(${current - 1})"
                    ${current === 1 ? 'disabled' : ''}
                >
                    Previous
                </button>
            </li>
            
            <!-- Page Numbers -->
            ${generatePageNumbers(current, totalPages)}
            
            <!-- Next Button -->
            <li>
                <button 
                    class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${current === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" 
                    onclick="changePage(${current + 1})"
                    ${current === totalPages ? 'disabled' : ''}
                >
                    Next
                </button>
            </li>
        </ul>
    </nav>
    `;
}

// Generate page number buttons
function generatePageNumbers(current, totalPages) {
    let pages = [];

    if (totalPages <= 7) {
        // Show all pages if total is 7 or less
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Show first page, last page, current page and neighbors
        if (current <= 3) {
            pages = [1, 2, 3, 4, '...', totalPages];
        } else if (current >= totalPages - 2) {
            pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', current - 1, current, current + 1, '...', totalPages];
        }
    }

    return pages.map(page => {
        if (page === '...') {
            return `
            <li>
                <span class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                    ...
                </span>
            </li>
            `;
        } else {
            const isActive = page === current;
            return `
            <li>
                <button 
                    class="px-3 py-2 leading-tight border ${isActive
                    ? 'text-blue-600 bg-blue-50 border-blue-300 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                }"
                    onclick="changePage(${page})"
                >
                    ${page}
                </button>
            </li>
            `;
        }
    }).join('');
}

// Change page function
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    loadProducts(currentPage);

    // Scroll to top of products
    const productsSection = document.getElementById("products-container");
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Auto-load first page when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, loading products...");
    loadProducts(currentPage);
});
