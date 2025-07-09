# Weather Backend API

Node.js REST API to fetch and cache weather data from weatherapi.com

## Endpoints

### GET `/weather?city={city_name}`
Returns current weather data for the specified city.

- Query param: `city` (required)

**Example**:
```
GET /weather?city=Berlin
```
#### Response:
- `200`: `{ source: "cache" | "live", data: { ... } }`
- `400`: Missing city parameter
- `500`: Weather provider error or backend error

---

### GET `/forecast?city={city_name}&days={num_days}`
Returns weather forecast data (up to 10 days, default 3) for the specified city.

- Query param: `city` (required), `days` (optional, default 3)

**Example**
```
GET /forecast?city=London&days=5
```

---

### GET `/airquality?city={city_name}`
Returns air quality measurement for the specified city.

- Query param: `city` (required)

**Example**
```
GET /airquality?city=Tokyo
```

---

All endpoints:
- Use in-memory cache for data (cached by city and days, when relevant).
- Cache expiry: 10 minutes.
- If cache is stale or missing, fetches fresh data from [weatherapi.com](https://weatherapi.com).

## Configuration

- The weatherapi.com API key is stored (temporarily) in `config/api-key.js`.
- Replace this approach with secure storage (e.g., via Supabase secrets) ASAP.
- **Do NOT commit secrets to source control in production.**

## Running

```
npm install
npm start
```
Server listens on port 4000 by default.

## Status

- Supabase secret management pending.
- For security: when Supabase integration is enabled, the API key will **not** be stored in this repo.
