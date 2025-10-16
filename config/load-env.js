// Load environment variables from .dev-env file for local development
async function loadEnvironmentVariables() {
    try {
        const response = await fetch('.dev-env');
        if (response.ok) {
            const envContent = await response.text();
            const lines = envContent.split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    if (key && valueParts.length > 0) {
                        let value = valueParts.join('=');
                        // Remove quotes if present
                        if ((value.startsWith("'") && value.endsWith("'")) || 
                            (value.startsWith('"') && value.endsWith('"'))) {
                            value = value.slice(1, -1);
                        }
                        
                        // Set API key if found
                        if (key === 'TRANSIT-API-KEY') {
                            if (window.StrollerTransitApi) {
                                window.StrollerTransitApi.setApiKey(value);
                                console.log('API key loaded from .dev-env');
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.log('No .dev-env file found or error loading it:', error.message);
    }
}

// Load environment variables when script loads
loadEnvironmentVariables();