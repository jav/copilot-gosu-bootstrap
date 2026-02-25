# ADO Work Item: Weather Forecast API Service

> Copy the content below into an Azure DevOps User Story work item. This is the work item that developers will query via Copilot during the tutorial.

---

## Work Item Fields

| Field | Value |
|-------|-------|
| **Type** | User Story |
| **Title** | Build a Weather Forecast API Service in Gosu |
| **Area Path** | CopilotBootstrap |
| **Iteration** | Sprint 1 |
| **State** | New |
| **Priority** | 2 |
| **Story Points** | 5 |

## Description

As a developer, I want a REST API service that returns weather forecast data for a given location and date, so that downstream applications can display weather information to users.

### Application Overview

Build a standalone REST API service using **Gosu** on top of **Spark Java** (port 4567). The service exposes a single endpoint that queries the Open-Meteo public forecast API and returns a curated JSON response with hourly weather data.

### Endpoint

```
GET /api/weather/forecast
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `latitude` | float | No | `40.7128` | Latitude of the location (default: New York City) |
| `longitude` | float | No | `-74.0060` | Longitude of the location (default: New York City) |
| `date` | string | No | today | Forecast date in `YYYY-MM-DD` format |

### Upstream API

Query the **Open-Meteo Forecast API**:

```
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly={variables}&start_date={date}&end_date={date}&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch
```

**Hourly variables to request:**
- `temperature_2m`
- `precipitation_probability`
- `precipitation`
- `wind_speed_10m`
- `relative_humidity_2m`

### Response Format

```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  },
  "date": "2025-06-15",
  "hourly": [
    {
      "time": "2025-06-15T00:00",
      "temperature_f": 72.5,
      "precipitation_probability_pct": 20,
      "precipitation_in": 0.0,
      "wind_speed_mph": 8.3,
      "relative_humidity_pct": 65
    }
  ]
}
```

### Error Response

```json
{
  "error": "Description of what went wrong"
}
```

Return HTTP 400 for invalid parameters and HTTP 502 for upstream API failures.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Language | Gosu (via `org.gosu-lang.gosu` Gradle plugin) |
| Build tool | Gradle with Gosu plugin |
| HTTP framework | Spark Java 2.9.4 (`com.sparkjava:spark-core`) |
| HTTP client | `java.net.http.HttpClient` (JDK built-in) |
| JSON parsing | `org.json:json:20231013` |
| Java version | 11 or higher |

## Acceptance Criteria

- [ ] `GET /api/weather/forecast` returns valid JSON with hourly weather data
- [ ] Default parameters (NYC coordinates, today's date) work when no query params are provided
- [ ] Custom latitude, longitude, and date parameters are accepted and forwarded to Open-Meteo
- [ ] Invalid parameter values return HTTP 400 with an error message
- [ ] Upstream API failures return HTTP 502 with an error message
- [ ] Unit tests cover: parameter parsing, URL construction, response transformation, error handling
- [ ] A test harness starts the server, makes sample requests, and validates responses
- [ ] Application starts on port 4567 via `./gradlew run`
- [ ] Project builds cleanly with `./gradlew build`
- [ ] All tests pass with `./gradlew test`
