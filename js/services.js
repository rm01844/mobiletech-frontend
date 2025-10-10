// js/services.js - Services Page Logic

/**
 * Load and display all services
 */
async function loadServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  showLoading('services-grid');

  try {
    const response = await getServices();

    if (response && response.data && response.data.length > 0) {
      displayServices(response.data, container);
    } else {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-500">No services found.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading services:', error);
    showError('services-grid', 'Failed to load services');
  }
}

/**
 * Display services in grid
 */
function displayServices(services, container) {
  container.innerHTML = services.map(service => {
    const { id, attributes } = service;
    const imageUrl = getStrapiImageUrl(attributes.image);

    return `
      <div class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
        <div class="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
          ${attributes.image ? `
            <img 
              src="${imageUrl}" 
              alt="${attributes.title}"
              class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onerror="this.parentElement.innerHTML='<div class=&quot;flex items-center justify-center h-full text-white text-6xl&quot;>${attributes.icon || '🔧'}</div>'"
            />
          ` : `
            <div class="flex items-center justify-center h-full text-white text-6xl">
              ${attributes.icon || '🔧'}
            </div>
          `}
        </div>
        
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
            ${attributes.title}
          </h3>
          
          <p class="mt-3 text-gray-600 leading-relaxed">
            ${truncateText(attributes.description, 150)}
          </p>
          
          <button 
            onclick="viewServiceDetail(${id})"
            class="mt-4 text-blue-600 font-medium hover:text-blue-700 transition inline-flex items-center"
          >
            Learn More
            <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * View service details
 */
function viewServiceDetail(serviceId) {
  const modal = document.getElementById('service-modal');
  if (modal) {
    loadServiceDetail(serviceId);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Load and display single service detail
 */
async function loadServiceDetail(serviceId) {
  const container = document.getElementById('service-modal-content');
  if (!container) return;

  container.innerHTML = `
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  `;

  try {
    const response = await getService(serviceId);

    if (response && response.data) {
      displayServiceDetail(response.data, container);
    } else {
      container.innerHTML = '<p class="text-red-600 text-center">Service not found.</p>';
    }
  } catch (error) {
    console.error('Error loading service detail:', error);
    container.innerHTML = '<p class="text-red-600 text-center">Failed to load service details.</p>';
  }
}

/**
 * Display service detail in modal
 */
function displayServiceDetail(service, container) {
  const { attributes } = service;
  const imageUrl = getStrapiImageUrl(attributes.image);

  container.innerHTML = `
    <div class="relative">
      <button 
        onclick="closeServiceModal()"
        class="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition z-10"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <div class="mb-6">
        ${attributes.image ? `
          <img 
            src="${imageUrl}" 
            alt="${attributes.title}"
            class="w-full h-64 object-cover rounded-lg"
            onerror="this.style.display='none'"
          />
        ` : `
          <div class="w-full h-64 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white text-8xl">
            ${attributes.icon || '🔧'}
          </div>
        `}
      </div>
      
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        ${attributes.title}
      </h2>
      
      <div class="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
        ${attributes.description}
      </div>
      
      <div class="mt-8 flex gap-4">
        <button 
          onclick="alert('Contact us for this service!')"
          class="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Request Service
        </button>
        <button 
          onclick="closeServiceModal()"
          class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  `;
}

/**
 * Close service modal
 */
function closeServiceModal() {
  const modal = document.getElementById('service-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}