# Expected ADO Query Output

When you ask Copilot to search for the weather API work item, you should see output similar to:

---

**Found 1 matching work item:**

## User Story #42: Build a Weather Forecast API Service in Gosu

**State:** New | **Priority:** 2 | **Story Points:** 5

### Summary

Build a standalone REST API service using Gosu on top of Spark Java (port 4567). The service exposes a single endpoint that queries the Open-Meteo public forecast API and returns hourly weather data as JSON.

### Key Requirements

- **Endpoint:** `GET /api/weather/forecast`
- **Parameters:** `latitude` (default 40.7128), `longitude` (default -74.006), `date` (default today)
- **Upstream API:** `api.open-meteo.com/v1/forecast`
- **Hourly variables:** temperature, precipitation probability, precipitation amount, wind speed, relative humidity
- **Tech stack:** Gosu + Gradle + Spark Java + java.net.http.HttpClient
- **Error handling:** HTTP 400 for invalid params, HTTP 502 for upstream failures

### Acceptance Criteria

- API returns valid JSON with hourly weather data
- Default parameters work without query params
- Custom parameters are forwarded to upstream
- Unit tests and test harness included
- Project builds with `./gradlew build` and runs with `./gradlew run`

---

> **Note:** The exact work item ID and formatting will vary depending on your ADO project. The key information should match the above.
