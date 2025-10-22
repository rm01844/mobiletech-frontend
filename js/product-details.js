// product-details.js

const baseURL = "https://8cac9444864f.ngrok-free.app";
const params = new URLSearchParams(window.location.search);
const productName = params.get("name");

// Helper function to fetch image as base64 (bypasses ngrok warning)
async function fetchImageAsBase64(imageUrl) {
  try {
    console.log("Fetching image:", imageUrl);
    const response = await fetch(imageUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image converted to base64 successfully");
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return 'https://via.placeholder.com/800x600?text=Image+Error';
  }
}

(async function () {
  if (!productName) {
    document.body.innerHTML = `<div class="text-center text-red-600 mt-10">No product name provided.</div>`;
    return;
  }

  console.log("Fetching product:", productName);

  try {
    // --- Fetch single product ---
    const res = await fetch(
      `${baseURL}/api/products?filters[name][$eq]=${encodeURIComponent(productName)}&populate=*`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      document.body.innerHTML = `<div class="text-center text-red-600 mt-10">Product not found.</div>`;
      return;
    }

    const item = data.data[0];
    const product = item.attributes || item;
    console.log("Parsed product:", product);

    const name = product.name || "Unnamed Product";
    const category = product.category || "Uncategorized";
    const price = product.price || 0;
    const stock = product.stock !== undefined ? product.stock : 0;
    const featured = product.featured || false;

    // --- Handle rich-text or nested descriptions ---
    let description = "No description available.";
    if (typeof product.description === "string") {
      description = product.description;
    } else if (Array.isArray(product.description)) {
      description = product.description
        .map(d => d.children?.[0]?.text || "")
        .join(" ");
    } else if (product.description?.children?.length) {
      description = product.description.children
        .map(c => c.text || "")
        .join(" ");
    }

    // --- Handle main product image with base64 conversion ---
    let imageUrl = "https://via.placeholder.com/800x600?text=No+Image";
    try {
      const imgField = product.image || product.images || product.picture;
      let originalImageUrl = "";

      if (imgField) {
        if (Array.isArray(imgField.data) && imgField.data.length > 0) {
          originalImageUrl = `${baseURL}${imgField.data[0].attributes.url}`;
        } else if (imgField.data?.attributes?.url) {
          originalImageUrl = `${baseURL}${imgField.data.attributes.url}`;
        } else if (imgField.url) {
          originalImageUrl = imgField.url.startsWith("http")
            ? imgField.url
            : `${baseURL}${imgField.url}`;
        }
      }

      // Convert to base64 if we have an ngrok URL
      if (originalImageUrl && originalImageUrl.includes('ngrok')) {
        imageUrl = await fetchImageAsBase64(originalImageUrl);
      } else if (originalImageUrl) {
        imageUrl = originalImageUrl;
      }
    } catch (e) {
      console.warn("Image parse failed:", e);
    }

    // --- Render single product section ---
    document.getElementById("product-container").innerHTML = `
      <div class="max-w-6xl mx-auto mt-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Product Image - Fixed aspect ratio -->
          <div class="relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-4">
            <img 
              src="${imageUrl}" 
              alt="${name}" 
              class="max-w-full max-h-96 object-contain rounded-lg"
              onerror="this.src='https://via.placeholder.com/800x600?text=Image+Error'"
            />
            ${featured ? '<span class="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Featured</span>' : ''}
            ${stock === 0 ? '<span class="absolute top-4 left-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full">Out of Stock</span>' : ''}
          </div>
          
          <!-- Product Info -->
          <div class="p-6 flex flex-col justify-between">
            <div>
              <span class="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase">${category}</span>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-2">${name}</h1>
              <p class="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">${description}</p>
              
              <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div class="flex items-baseline gap-3">
                  <span class="text-4xl font-bold text-blue-600 dark:text-blue-400">$${price.toFixed(2)}</span>
                  ${stock > 0 ? `<span class="text-sm text-green-600 dark:text-green-400">${stock} in stock</span>` : '<span class="text-sm text-red-600 dark:text-red-400">Out of stock</span>'}
                </div>
              </div>
            </div>
            
            <div class="mt-8 flex gap-4">
              <button 
                class="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                ${stock === 0 ? 'disabled' : ''}
                onclick="addToCart('${item.id}', '${name.replace(/'/g, "\\'")}', ${price})">
                ${stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                onclick="window.history.back()"
                class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="max-w-6xl mx-auto mt-16">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          More ${category} Products
        </h2>
        
        <!-- Carousel Container -->
        <div class="relative">
          <!-- Navigation Buttons -->
          <button 
            id="carousel-prev" 
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition hidden"
            onclick="scrollCarousel('left')">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <button 
            id="carousel-next" 
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition hidden"
            onclick="scrollCarousel('right')">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          
          <!-- Carousel Track -->
          <div 
            id="related-products" 
            class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-4"
            style="scrollbar-width: none; -ms-overflow-style: none;">
            <!-- Products will be inserted here -->
          </div>
        </div>
      </div>
    `;

    // --- Fetch related products (same category) ---
    if (category && category !== "Uncategorized") {
      const relRes = await fetch(
        `${baseURL}/api/products?filters[category][$eq]=${encodeURIComponent(category)}&populate=image`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      const relData = await relRes.json();

      const relatedContainer = document.getElementById("related-products");
      relatedContainer.innerHTML = "";

      let relatedCount = 0;

      for (const r of relData.data) {
        const rel = r.attributes || r;
        if (rel.name === name) continue; // skip current product

        let relImg = "https://via.placeholder.com/400x300?text=No+Image";
        let originalRelImg = "";

        try {
          const imgField = rel.image || rel.images || rel.picture;

          if (imgField) {
            // Case 1: Strapi v4 "data" array or object
            if (Array.isArray(imgField.data) && imgField.data.length > 0) {
              originalRelImg = `${baseURL}${imgField.data[0].attributes.url}`;
            } else if (imgField.data?.attributes?.url) {
              originalRelImg = `${baseURL}${imgField.data.attributes.url}`;
            }

            // Case 2: Direct URL returned (no .data wrapper)
            else if (imgField.url) {
              originalRelImg = imgField.url.startsWith("http")
                ? imgField.url
                : `${baseURL}${imgField.url}`;
            }
          }

          // Convert to base64 always (for deployment compatibility)
          if (originalRelImg) {
            relImg = await fetchImageAsBase64(originalRelImg);
          }

        } catch (e) {
          console.warn("Related image parse failed:", e);
        }

        // Convert related product images to base64
        if (originalRelImg && originalRelImg.includes('ngrok')) {
          relImg = await fetchImageAsBase64(originalRelImg);
        } else if (originalRelImg) {
          relImg = originalRelImg;
        }

        // Get description snippet
        let descSnippet = "";
        if (typeof rel.description === "string") {
          descSnippet = rel.description.substring(0, 80) + "...";
        } else if (Array.isArray(rel.description)) {
          descSnippet = rel.description.map(d => d.children?.[0]?.text || "").join(" ").substring(0, 80) + "...";
        } else if (rel.description?.children) {
          descSnippet = rel.description.children.map(c => c.text || "").join(" ").substring(0, 80) + "...";
        }

        relatedContainer.insertAdjacentHTML(
          "beforeend",
          `
          <div class="flex-none w-80 snap-start">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-shadow duration-300 h-full">
              <div class="relative h-56 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <img 
                  src="${relImg}" 
                  alt="${rel.name}" 
                  class="w-full h-full object-cover"
                  onerror="this.src='https://via.placeholder.com/400x300?text=Image+Error'">
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${rel.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  ${descSnippet}
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold text-blue-600 dark:text-blue-400">$${(rel.price || 0).toFixed(2)}</span>
                  <button 
                    onclick="window.location.href='product.html?name=${encodeURIComponent(rel.name)}'"
                    class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>`
        );

        relatedCount++;
      }

      // Show/hide carousel navigation based on content width
      updateCarouselNavigation();

      // Add scroll event listener to update navigation buttons
      relatedContainer.addEventListener('scroll', updateCarouselNavigation);
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    document.body.innerHTML = `<div class="text-center text-red-600 mt-10">Error loading product details: ${err.message}</div>`;
  }
})();

// --- Carousel Navigation Functions ---
function scrollCarousel(direction) {
  const container = document.getElementById('related-products');
  const scrollAmount = 350; // Width of one card + gap

  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

function updateCarouselNavigation() {
  const container = document.getElementById('related-products');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!container || !prevBtn || !nextBtn) return;

  // Check if carousel is needed (content wider than container)
  const needsCarousel = container.scrollWidth > container.clientWidth;

  if (needsCarousel) {
    prevBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');

    // Hide prev button at start
    if (container.scrollLeft <= 10) {
      prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // Hide next button at end
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  } else {
    prevBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
  }
}

// --- Cart logic ---
function addToCart(id, name, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, name, price, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));

  // Show success message
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.innerHTML = '✓ Added!';
  btn.classList.add('bg-green-600', 'hover:bg-green-700');
  btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove('bg-green-600', 'hover:bg-green-700');
    btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
  }, 2000);
}

// Add CSS to hide scrollbar
const style = document.createElement('style');
style.textContent = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);
