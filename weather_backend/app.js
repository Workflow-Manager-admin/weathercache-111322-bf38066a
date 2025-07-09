//
// weather_backend/app.js
//
// Node.js Express REST API to fetch and cache weather data from weatherapi.com
// Endpoints: /weather (current), /forecast (optional), /airquality (optional)
//
// Caches weather data in memory keyed by city with a sensible expiry.
//
// API key is loaded from config/api-key.js (to be replaced with secure storage).
//

const express = require('express');
const axios = require('axios');
const { getWeatherApiKey } = require('./config/api-key');

const app = express();
const PORT = process.env.PORT || 4000;

// In-memory cache { [city]: { data, timestamp } }
const cache = {
    weather: {},
    forecast: {},
    airquality: {}
};
// Cache expiry in milliseconds (e.g., 10 minutes)
const CACHE_TTL = 10 * 60 * 1000;

// Configuration
const WEATHER_API_KEY = getWeatherApiKey();
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

// Utility to check if cached data is still valid
function isCacheValid(entry) {
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < CACHE_TTL;
}

// PUBLIC_INTERFACE
/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Get current weather by city
 *     description: Returns the current weather information for the specified city.
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         description: Name of the city to fetch weather for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Weather data returned successfully.
 *       400:
 *         description: Missing or invalid city parameter.
 *       500:
 *         description: Failed to fetch data from weather API.
 */
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: 'Missing city parameter' });
    }

    // Return cached data if fresh
    if (isCacheValid(cache.weather[city])) {
        return res.json({ source: "cache", data: cache.weather[city].data });
    }

    try {
        const resp = await axios.get(`${WEATHER_API_BASE_URL}/current.json`, {
            params: { 
                key: WEATHER_API_KEY,
                q: city
            }
        });
        const data = resp.data;
        // Store in cache
        cache.weather[city] = { data, timestamp: Date.now() };
        res.json({ source: "live", data });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch weather data", details: err.response ? err.response.data : err.message });
    }
});

// PUBLIC_INTERFACE
/**
 * @swagger
 * /forecast:
 *   get:
 *     summary: Get weather forecast by city
 *     description: Returns the weather forecast for up to 3 days for the specified city.
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         description: Name of the city to fetch forecast for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Forecast data returned successfully.
 *       400:
 *         description: Missing or invalid city parameter.
 *       500:
 *         description: Failed to fetch data from weather API.
 */
app.get('/forecast', async (req, res) => {
    const city = req.query.city;
    const days = Math.min(Number(req.query.days) || 3, 10); // Allow up to 10 day forecast
    if (!city) {
        return res.status(400).json({ error: 'Missing city parameter' });
    }

    // Return cached data if fresh
    const cacheKey = `${city.toLowerCase()}_${days}`;
    if (isCacheValid(cache.forecast[cacheKey])) {
        return res.json({ source: "cache", data: cache.forecast[cacheKey].data });
    }

    try {
        const resp = await axios.get(`${WEATHER_API_BASE_URL}/forecast.json`, {
            params: { 
                key: WEATHER_API_KEY,
                q: city,
                days
            }
        });
        const data = resp.data;
        // Store in cache
        cache.forecast[cacheKey] = { data, timestamp: Date.now() };
        res.json({ source: "live", data });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch forecast", details: err.response ? err.response.data : err.message });
    }
});

// PUBLIC_INTERFACE
/**
 * @swagger
 * /airquality:
 *   get:
 *     summary: Get air quality for a city
 *     description: Returns the air quality information for the specified city.
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         description: Name of the city to fetch air quality for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Air quality data returned successfully.
 *       400:
 *         description: Missing or invalid city parameter.
 *       500:
 *         description: Failed to fetch data from weather API.
 */
app.get('/airquality', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: 'Missing city parameter' });
    }

    // Return cached data if fresh
    if (isCacheValid(cache.airquality[city])) {
        return res.json({ source: "cache", data: cache.airquality[city].data });
    }

    try {
        // air quality info included with current.json, but require aqi param set to yes
        const resp = await axios.get(`${WEATHER_API_BASE_URL}/current.json`, {
            params: { 
                key: WEATHER_API_KEY,
                q: city,
                aqi: 'yes'
            }
        });
        // Only return the "air_quality" portion
        const air_quality = resp.data.current.air_quality || null;
        const result = { location: resp.data.location, air_quality };

        cache.airquality[city] = { data: result, timestamp: Date.now() };
        res.json({ source: "live", data: result });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch air quality", details: err.response ? err.response.data : err.message });
    }
});

// Root
app.get('/', (req, res) => {
    res.json({
        api: "Weather Backend",
        endpoints: [
            { path: "/weather", description: "Get current weather by city", params: ["city"] },
            { path: "/forecast", description: "Get weather forecast by city", params: ["city", "days (optional, default 3)"] },
            { path: "/airquality", description: "Get air quality info by city", params: ["city"] }
        ],
        docs: "Swagger/OAS available soon",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Weather backend listening on port ${PORT}`);
    console.log(`Endpoints: /weather, /forecast, /airquality`);
});

module.exports = app;
