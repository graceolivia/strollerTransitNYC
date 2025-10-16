// API configuration will be loaded via script tag since ES modules 
// may not work on all GitHub Pages configurations

class StrollerTransitApp {
    constructor() {
        this.form = document.getElementById('routeForm');
        this.loading = document.getElementById('loading');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.routeResults = document.getElementById('routeResults');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.form);
        const routeRequest = {
            from: formData.get('fromAddress'),
            to: formData.get('toAddress'),
            strollerAccessible: formData.get('strollerAccessible') === 'on',
            elevatorAccess: formData.get('elevatorAccess') === 'on'
        };

        // Validate input
        if (!routeRequest.from || !routeRequest.to) {
            this.showError('Please enter both starting and destination addresses.');
            return;
        }

        await this.findRoute(routeRequest);
    }

    async findRoute(routeRequest) {
        this.showLoading();
        
        try {
            // Check if API key is configured
            const apiKey = window.StrollerTransitApi ? window.StrollerTransitApi.getApiKey() : null;
            if (!apiKey) {
                throw new Error('Transitland API key not configured. Please set up your API key.');
            }

            // Geocode addresses first
            const fromCoords = await this.geocodeAddress(routeRequest.from);
            const toCoords = await this.geocodeAddress(routeRequest.to);

            // Find transit route using Transitland API
            const route = await this.getTransitRoute(fromCoords, toCoords, routeRequest);
            
            this.displayResults(route);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async geocodeAddress(address) {
        // For now, return mock coordinates for NYC area
        // In production, you'd use a geocoding service
        const mockCoords = {
            [address.toLowerCase()]: {
                lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                lon: -74.0060 + (Math.random() - 0.5) * 0.1
            }
        };

        return mockCoords[address.toLowerCase()] || {
            lat: 40.7128,
            lon: -74.0060
        };
    }

    async getTransitRoute(fromCoords, toCoords, options) {
        const apiKey = window.StrollerTransitApi ? window.StrollerTransitApi.getApiKey() : null;
        
        // Mock API response for development
        // Replace with actual Transitland API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    duration: Math.floor(Math.random() * 45 + 15), // 15-60 minutes
                    distance: (Math.random() * 10 + 1).toFixed(1), // 1-11 miles
                    transfers: Math.floor(Math.random() * 3), // 0-2 transfers
                    accessibility: {
                        strollerFriendly: options.strollerAccessible,
                        hasElevators: options.elevatorAccess
                    },
                    routes: [
                        {
                            line: 'L Train',
                            direction: 'Manhattan-bound',
                            stops: ['Bedford Ave', '1st Ave', 'Union Square']
                        },
                        {
                            line: '4/5/6 Express',
                            direction: 'Uptown',
                            stops: ['Union Square', 'Grand Central', 'Times Square']
                        }
                    ]
                });
            }, 1500);
        });

        // Actual API call would look like this:
        /*
        const response = await fetch(`https://transit.land/api/v2/rest/routes?lon=${fromCoords.lon}&lat=${fromCoords.lat}&radius=1000&api_key=${apiKey}`);
        if (!response.ok) {
            throw new Error('Failed to fetch transit data');
        }
        return await response.json();
        */
    }

    displayResults(route) {
        const accessibilityBadges = [];
        if (route.accessibility.strollerFriendly) {
            accessibilityBadges.push('<span class="badge stroller">🚼 Stroller Friendly</span>');
        }
        if (route.accessibility.hasElevators) {
            accessibilityBadges.push('<span class="badge elevator">🛗 Elevator Access</span>');
        }

        const routeSteps = route.routes.map(r => `
            <div class="route-step">
                <div class="route-line">${r.line}</div>
                <div class="route-direction">${r.direction}</div>
                <div class="route-stops">${r.stops.join(' → ')}</div>
            </div>
        `).join('');

        this.routeResults.innerHTML = `
            <div class="route-summary">
                <div class="summary-item">
                    <span class="summary-icon">⏱️</span>
                    <span class="summary-value">${route.duration} min</span>
                </div>
                <div class="summary-item">
                    <span class="summary-icon">📍</span>
                    <span class="summary-value">${route.distance} mi</span>
                </div>
                <div class="summary-item">
                    <span class="summary-icon">🔄</span>
                    <span class="summary-value">${route.transfers} transfers</span>
                </div>
            </div>
            
            ${accessibilityBadges.length > 0 ? `
                <div class="accessibility-badges">
                    ${accessibilityBadges.join('')}
                </div>
            ` : ''}
            
            <div class="route-steps">
                <h3 class="steps-title">Route Details</h3>
                ${routeSteps}
            </div>
        `;

        // Add additional CSS for results display
        this.addResultsStyles();
        this.showResults();
    }

    addResultsStyles() {
        if (document.getElementById('results-styles')) return;

        const style = document.createElement('style');
        style.id = 'results-styles';
        style.textContent = `
            .route-summary {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .summary-item {
                text-align: center;
                flex: 1;
            }
            
            .summary-icon {
                display: block;
                font-size: 1.2rem;
                margin-bottom: 0.25rem;
            }
            
            .summary-value {
                font-weight: 600;
                color: #333;
            }
            
            .accessibility-badges {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
                flex-wrap: wrap;
            }
            
            .badge {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .badge.stroller {
                background: #e3f2fd;
                color: #1976d2;
            }
            
            .badge.elevator {
                background: #f3e5f5;
                color: #7b1fa2;
            }
            
            .steps-title {
                font-size: 1.1rem;
                margin-bottom: 1rem;
                color: #333;
            }
            
            .route-step {
                margin-bottom: 1rem;
                padding: 1rem;
                border-left: 4px solid #667eea;
                background: #f8f9fa;
                border-radius: 0 8px 8px 0;
            }
            
            .route-line {
                font-weight: 600;
                color: #667eea;
                margin-bottom: 0.25rem;
            }
            
            .route-direction {
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 0.5rem;
            }
            
            .route-stops {
                font-size: 0.85rem;
                color: #555;
            }
            
            .error-message {
                background: #ffebee;
                color: #c62828;
                padding: 1rem;
                border-radius: 8px;
                border-left: 4px solid #c62828;
                margin-bottom: 1rem;
            }
        `;
        document.head.appendChild(style);
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.resultsContainer.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
    }

    showError(message) {
        this.routeResults.innerHTML = `
            <div class="error-message">
                <strong>Error:</strong> ${message}
            </div>
        `;
        this.addResultsStyles();
        this.showResults();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StrollerTransitApp();
});