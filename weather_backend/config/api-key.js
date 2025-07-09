//
// weather_backend/config/api-key.js
//
// Temporary solution: Stores WeatherAPI.com API key as a module export.
// In production, do NOT commit the actual API key or config file to VCS!
//
// This file will be replaced once Supabase integration is available.
//
// Instructions:
// 1. Rename this file to "api-key.js" (if currently "api-key.template.js").
// 2. Replace the placeholder with your actual API key.
//

// PUBLIC_INTERFACE
/**
 * Returns the WeatherAPI.com API key for backend service.
 * @returns {string} API key (not to be committed to repository)
 */
function getWeatherApiKey() {
    // TODO: Replace with Supabase secrets management
    return "03378a93aa0f42a1bc962751250907";
}

module.exports = { getWeatherApiKey };
