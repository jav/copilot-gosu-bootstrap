package weather

uses java.net.URI
uses java.net.http.HttpClient
uses java.net.http.HttpRequest
uses java.net.http.HttpResponse
uses org.json.JSONObject
uses spark.Spark

/**
 * Integration test harness that starts the server, sends real HTTP requests,
 * and validates responses. Run with: ./gradlew run -PmainClass=weather.TestHarness
 */
class TestHarness {

  static var passed : int = 0
  static var failed : int = 0
  static var client : HttpClient

  static function main(args : String[]) {
    client = HttpClient.newHttpClient()

    print("=== Weather API Test Harness ===")
    print("")

    // Start the server
    print("Starting server on port 4567...")
    WeatherApp.setupRoutes()
    Spark.awaitInitialization()
    print("Server started.")
    print("")

    try {
      testDefaultParameters()
      testCustomParameters()
      testInvalidLatitude()
      testInvalidDate()
      testResponseStructure()
    } finally {
      print("")
      print("=== Results: " + passed + " passed, " + failed + " failed ===")
      Spark.stop()
    }
  }

  static function testDefaultParameters() {
    print("Test: Default parameters (NYC, today)")
    var response = get("/api/weather/forecast", 200)
    if (response != null) {
      var json = new JSONObject(response)
      check("Has location", json.has("location"))
      check("Has date", json.has("date"))
      check("Has hourly", json.has("hourly"))
      check("Hourly is non-empty", json.getJSONArray("hourly").length() > 0)
    }
  }

  static function testCustomParameters() {
    print("Test: Custom parameters (LA)")
    var response = get("/api/weather/forecast?latitude=34.0522&longitude=-118.2437&date=2025-06-20", 200)
    if (response != null) {
      var json = new JSONObject(response)
      var loc = json.getJSONObject("location")
      check("Latitude matches", Math.abs(loc.getDouble("latitude") - 34.0522) < 0.01)
      check("Longitude matches", Math.abs(loc.getDouble("longitude") - (-118.2437)) < 0.01)
      check("Date matches", json.getString("date").equals("2025-06-20"))
    }
  }

  static function testInvalidLatitude() {
    print("Test: Invalid latitude (expect 400)")
    var response = get("/api/weather/forecast?latitude=999", 400)
    if (response != null) {
      var json = new JSONObject(response)
      check("Has error field", json.has("error"))
      check("Error mentions latitude", json.getString("error").toLowerCase().contains("latitude"))
    }
  }

  static function testInvalidDate() {
    print("Test: Invalid date format (expect 400)")
    var response = get("/api/weather/forecast?date=not-a-date", 400)
    if (response != null) {
      var json = new JSONObject(response)
      check("Has error field", json.has("error"))
    }
  }

  static function testResponseStructure() {
    print("Test: Response structure validation")
    var response = get("/api/weather/forecast", 200)
    if (response != null) {
      var json = new JSONObject(response)
      var hourly = json.getJSONArray("hourly")
      var firstHour = hourly.getJSONObject(0)
      check("Hour has time", firstHour.has("time"))
      check("Hour has temperature_f", firstHour.has("temperature_f"))
      check("Hour has precipitation_probability_pct", firstHour.has("precipitation_probability_pct"))
      check("Hour has precipitation_in", firstHour.has("precipitation_in"))
      check("Hour has wind_speed_mph", firstHour.has("wind_speed_mph"))
      check("Hour has relative_humidity_pct", firstHour.has("relative_humidity_pct"))
    }
  }

  private static function get(path : String, expectedStatus : int) : String {
    try {
      var request = HttpRequest.newBuilder()
          .uri(URI.create("http://localhost:4567" + path))
          .GET()
          .build()
      var response = client.send(request, HttpResponse.BodyHandlers.ofString())
      var actualStatus = response.statusCode()
      if (actualStatus != expectedStatus) {
        printFail("Expected status " + expectedStatus + " but got " + actualStatus)
        return null
      }
      printPass("Status " + actualStatus)
      return response.body() as String
    } catch (ex : Exception) {
      printFail("Request failed: " + ex.getMessage())
      return null
    }
  }

  private static function check(description : String, condition : boolean) {
    if (condition) {
      printPass(description)
    } else {
      printFail(description)
    }
  }

  private static function printPass(msg : String) {
    print("  PASS: " + msg)
    passed++
  }

  private static function printFail(msg : String) {
    print("  FAIL: " + msg)
    failed++
  }
}
