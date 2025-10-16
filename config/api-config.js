// API Configuration for Transitland
// This file handles API key management for the application

class ApiConfig {
    constructor() {
        this.apiKey = null;
        this.loadApiKey();
    }

    loadApiKey() {
        // Try to load from localStorage first (for development)
        const storedKey = localStorage.getItem('transitland_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
            return;
        }

        // In production, you would load from environment variables or secure config
        // For GitHub Pages deployment, the key should be set via the UI
        this.apiKey = this.getEnvironmentApiKey();
    }

    getEnvironmentApiKey() {
        // Placeholder for environment variable or build-time substitution
        // Replace 'YOUR_API_KEY_HERE' with actual key during deployment
        const envKey = 'YOUR_API_KEY_HERE';

        // Don't use placeholder values
        if (envKey === 'YOUR_API_KEY_HERE') {
            return null;
        }

        return envKey;
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('transitland_api_key', key);
    }

    getApiKey() {
        return this.apiKey;
    }

    isConfigured() {
        return this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE';
    }

    // Transitland API endpoints
    getBaseUrl() {
        return 'https://transit.land/api/v2/rest';
    }

    getRouteUrl() {
        return `${this.getBaseUrl()}/routes`;
    }

    getStopsUrl() {
        return `${this.getBaseUrl()}/stops`;
    }

    // Build request headers with API key
    getRequestHeaders() {
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        };
    }

    // Build API URL with key parameter
    buildApiUrl(endpoint, params = {}) {
        const url = new URL(endpoint);

        // Add API key as parameter
        if (this.apiKey) {
            url.searchParams.set('api_key', this.apiKey);
        }

        // Add other parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value.toString());
            }
        });

        return url.toString();
    }
}

// Create singleton instance
const apiConfig = new ApiConfig();

// Attach to window for browser compatibility
if (typeof window !== 'undefined') {
    window.StrollerTransitApi = {
        getApiKey: function() {
            return apiConfig.getApiKey();
        },
        setApiKey: function(key) {
            return apiConfig.setApiKey(key);
        },
        isApiConfigured: function() {
            return apiConfig.isConfigured();
        },
        getApiConfig: function() {
            return apiConfig;
        }
    };
}
