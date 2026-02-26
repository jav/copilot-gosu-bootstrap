# Weather Forecast API Service — Project Specification

This specification is self-contained. An AI coding assistant or developer should be able to reproduce the entire project from this document alone.

---

## 1. Overview

**Purpose:** Build a lightweight REST API service that returns weather forecast data for a given location and date. The service acts as a proxy to the Open-Meteo public forecast API, transforming the upstream response into a clean, curated JSON format.

**System summary:** A single Gosu application running on Spark Java (embedded Jetty) that:
1. Accepts HTTP GET requests with optional location and date parameters
2. Queries the Open-Meteo forecast API for hourly weather data
3. Transforms and returns the data as a structured JSON response

---

## 2. Technology Stack

| Component | Technology | Version / Notes |
|-----------|-----------|-----------------|
| Language | Gosu | Latest via Gradle plugin |
| Gradle plugin | `org.gosu-lang.gosu` | Applied in `build.gradle` |
| Build tool | Gradle | 8.x via wrapper (`gradlew`) |
| HTTP framework | Spark Java | `com.sparkjava:spark-core:2.9.4` |
| HTTP client | `java.net.http.HttpClient` | JDK built-in (Java 11+) |
| JSON library | org.json | `org.json:json:20231013` |
| Java | OpenJDK | 11 or higher |

---

## 3. Project Structure

```
weather-api/
├── build.gradle
├── settings.gradle
├── gradle.properties
├── gradlew
├── gradlew.bat
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── src/
│   ├── main/
│   │   └── gosu/
│   │       └── weather/
│   │           ├── WeatherApp.gs
│   │           └── WeatherService.gs
│   └── test/
│       └── gosu/
│           └── weather/
│               └── WeatherServiceTest.gs
```

### `settings.gradle`

```groovy
rootProject.name = 'weather-api'
```

### `gradle.properties`

```properties
gosuVersion=1.18.7
```

### `build.gradle`

```groovy
plugins {
    id 'org.gosu-lang.gosu' version '8.0.1'
    id 'application'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation "org.gosu-lang.gosu:gosu-core:${gosuVersion}"
    implementation "org.gosu-lang.gosu:gosu-core-api:${gosuVersion}"
    implementation 'com.sparkjava:spark-core:2.9.4'
    implementation 'org.json:json:20231013'
    implementation 'org.slf4j:slf4j-simple:2.0.9'

    testImplementation "org.gosu-lang.gosu:gosu-test-api:${gosuVersion}"
    testImplementation 'junit:junit:4.13.2'
}

application {
    mainClass = 'weather.WeatherApp'
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}
```

---

## 4. API Specification

### Endpoint

```
GET /api/weather/forecast
```

### Query Parameters

| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| `latitude` | float | No | `40.7128` | Must be between -90 and 90 |
| `longitude` | float | No | `-74.0060` | Must be between -180 and 180 |
| `date` | string | No | Today (`YYYY-MM-DD`) | Must match `YYYY-MM-DD` format |

### Success Response (HTTP 200)

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

The `hourly` array contains 24 entries (one per hour, 00:00 through 23:00).

### Error Responses

**HTTP 400 — Bad Request** (invalid parameters):
```json
{
  "error": "Invalid latitude: must be between -90 and 90"
}
```

**HTTP 502 — Bad Gateway** (upstream API failure):
```json
{
  "error": "Failed to fetch forecast from upstream API"
}
```

### Content Type

All responses use `Content-Type: application/json`.

---

## 5. Open-Meteo Upstream API

### Request

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude={latitude}
    &longitude={longitude}
    &hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,relative_humidity_2m
    &start_date={date}
    &end_date={date}
    &temperature_unit=fahrenheit
    &wind_speed_unit=mph
    &precipitation_unit=inch
```

### Response (relevant fields)

```json
{
  "latitude": 40.710335,
  "longitude": -73.99307,
  "hourly": {
    "time": ["2025-06-15T00:00", "2025-06-15T01:00", "..."],
    "temperature_2m": [72.5, 71.8, "..."],
    "precipitation_probability": [20, 15, "..."],
    "precipitation": [0.0, 0.0, "..."],
    "wind_speed_10m": [8.3, 7.9, "..."],
    "relative_humidity_2m": [65, 67, "..."]
  }
}
```

The upstream returns arrays of values indexed by hour. The service must zip these arrays into per-hour objects.

---

## 6. Implementation Details

### `weather/WeatherService.gs`

A stateless service class responsible for all business logic.

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `fetchForecast` | `(lat: double, lon: double, date: String): String` | Main entry: builds URL, calls upstream, transforms response. Returns JSON string. |
| `buildUpstreamUrl` | `(lat: double, lon: double, date: String): String` | Constructs the Open-Meteo URL with all parameters. |
| `callUpstreamApi` | `(url: String): String` | Makes HTTP GET request using `java.net.http.HttpClient`. Returns response body. Throws on non-200 status. |
| `transformResponse` | `(upstreamJson: String, lat: double, lon: double, date: String): String` | Parses upstream JSON, zips hourly arrays into per-hour objects, builds final response JSON. |
| `validateLatitude` | `(lat: double): void` | Throws `IllegalArgumentException` if out of range. |
| `validateLongitude` | `(lon: double): void` | Throws `IllegalArgumentException` if out of range. |
| `validateDate` | `(date: String): void` | Throws `IllegalArgumentException` if format is invalid. |

**Logic flow in `fetchForecast`:**
1. Validate latitude, longitude, and date
2. Build the upstream URL via `buildUpstreamUrl`
3. Call the upstream API via `callUpstreamApi`
4. Transform the response via `transformResponse`
5. Return the transformed JSON string

### `weather/WeatherApp.gs`

The application entry point. Contains `main()` and route setup.

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `main` | `(args: String[]): void` | Static entry point. Calls `setupRoutes()`. |
| `setupRoutes` | `(): void` | Configures Spark routes and exception handlers. |

**Route handler logic for `GET /api/weather/forecast`:**
1. Extract `latitude`, `longitude`, `date` from query params (apply defaults if absent)
2. Parse latitude/longitude to `double`, date to `String`
3. Call `WeatherService.fetchForecast(lat, lon, date)`
4. Set response type to `application/json` and return the result
5. Catch `NumberFormatException` → HTTP 400 with error JSON (must come before `IllegalArgumentException` since it's a subclass)
6. Catch `IllegalArgumentException` → HTTP 400 with error JSON
7. Catch all other exceptions → HTTP 502 with error JSON

---

## 7. Testing

### Unit Tests (`WeatherServiceTest.gs`)

Test cases:

| # | Test | Description |
|---|------|-------------|
| 1 | `testBuildUpstreamUrl` | Verify URL contains correct lat, lon, date, and all hourly variables |
| 2 | `testBuildUpstreamUrlEncoding` | Verify URL handles negative coordinates correctly |
| 3 | `testTransformResponse` | Provide a sample upstream JSON string, verify output structure and field mapping |
| 4 | `testTransformResponseHourlyCount` | Verify output contains 24 hourly entries for a full day |
| 5 | `testValidateLatitudeValid` | No exception for valid values (0, 45, -90, 90) |
| 6 | `testValidateLatitudeInvalid` | Exception for values outside -90..90 |
| 7 | `testValidateLongitudeValid` | No exception for valid values (0, -180, 180) |
| 8 | `testValidateLongitudeInvalid` | Exception for values outside -180..180 |
| 9 | `testValidateDateValid` | No exception for `2025-06-15` format |
| 10 | `testValidateDateInvalid` | Exception for `06/15/2025`, `abc`, empty string |

### Test Harness

A standalone script or Gosu class that:
1. Starts the Spark server on port 4567
2. Waits for the server to be ready
3. Sends HTTP requests to the local endpoint
4. Validates responses (status codes, JSON structure, field presence)
5. Prints results to stdout
6. Shuts down the server

---

## 8. Gosu Language Notes

Gosu is a JVM language with Java-like syntax. Key patterns for this project:

- **File extension:** `.gs` for classes, `.gsx` for enhancements (not used here)
- **Package declaration:** `package weather` at the top of each file
- **Java interop:** All Java classes are directly available. Use `uses` statements (equivalent to Java `import`):
  ```gosu
  uses java.net.http.HttpClient
  uses java.net.http.HttpRequest
  uses java.net.http.HttpResponse
  uses java.net.URI
  ```
- **Variable declaration:** `var x = value` (type-inferred) or `var x : Type = value`
- **String interpolation:** Not supported in standard Gosu — use string concatenation or `String.format()`
- **Static methods:** Declared with `static` keyword, same as Java
- **For loops:** Gosu uses `for...in` syntax, NOT C-style for loops. Use `for (i in 0..|n)` for index-based iteration (exclusive upper bound with `|`)
- **Methods:** Use `function` keyword: `function myMethod(param : Type) : ReturnType { }`
- **Properties:** Use `property get PropertyName(): Type` syntax
- **Null handling:** Gosu supports `?.` for null-safe navigation
- **Collections:** Java collections work directly; Gosu adds functional methods (`.map()`, `.where()`, etc.)
- **Main method:** `static function main(args: String[])` in a class
- **Anonymous classes:** Use `new Interface() { override function method() : Type { } }` syntax
- **Source directory:** `src/main/gosu/` (not `src/main/java/`)
- **Test directory:** `src/test/gosu/` (not `src/test/java/`)
- **Test class:** Extends `gw.test.TestClass` from `gosu-test-api`

---

## 9. Build and Run Instructions

### Build

```bash
./gradlew build
```

### Run Tests

```bash
./gradlew test
```

### Start the Server

```bash
./gradlew run
```

### Verify with curl

```bash
# Default parameters (NYC, today)
curl http://localhost:4567/api/weather/forecast

# Custom location and date
curl "http://localhost:4567/api/weather/forecast?latitude=34.0522&longitude=-118.2437&date=2025-06-20"

# Invalid parameter (expect HTTP 400)
curl -w "\n%{http_code}" "http://localhost:4567/api/weather/forecast?latitude=999"
```

---

## 10. Tutorial Repository Structure

This specification lives inside a tutorial repository with the following organization:

```
copilot-bootstrap/          (this repo)
├── README.md               Step-by-step tutorial for developers
├── docs/
│   └── specification.md    This file — full project spec
├── .gitignore
```

### Branch Strategy

The `main` branch contains only documentation (no application code). Step branches provide reference implementations at each stage:

| Branch | Contents |
|--------|----------|
| `main` | README, docs, .gitignore |
| `step/00-prerequisites` | Same as main (checkpoint) |
| `step/01-install-copilot` | Same as main (checkpoint) |
| `step/02-configure-ado` | Checkpoint — `az` CLI configured |
| `step/03-query-work-item` | + `reference/expected-query-output.md` |
| `step/04-scaffold-project` | + `reference/build.gradle`, `settings.gradle`, `gradle.properties`, empty src dirs |
| `step/05-generate-service` | + `reference/src/main/gosu/weather/WeatherService.gs`, `WeatherApp.gs` |
| `step/06-tests-and-run` | + `reference/src/test/gosu/weather/WeatherServiceTest.gs`, test harness |

Developers can compare their progress against any step branch:

```bash
git diff main..step/04-scaffold-project -- reference/
```

### ADO Work Item

The work item lives in Azure DevOps. During the tutorial, developers use the `az` CLI to fetch the work item and feed its requirements into Copilot.
