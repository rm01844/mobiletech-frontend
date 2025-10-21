// API Configuration
const API_BASE_URL = 'https://8cac9444864f.ngrok-free.app/api';

// Helper function to fetch from Strapi with ngrok headers
async function fetchFromStrapi(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js initialized with API:', API_BASE_URL);
    
    // Load initial products if container exists
    if (document.getElementById('products-container')) {
        console.log('Products container found, loading products...');
    }
    
    // Initialize dark mode toggle if it exists
    initializeDarkMode();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
});

// Dark mode functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (!darkModeToggle) return;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        
        // Save preference
        const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Export fetch helper for use in other scripts
window.fetchFromStrapi = fetchFromStrapi;
window.API_BASE_URL = API_BASE_URL;
