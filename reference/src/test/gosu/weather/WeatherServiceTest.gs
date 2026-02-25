package weather

uses org.json.JSONObject
uses org.json.JSONArray
uses gw.test.TestClass

class WeatherServiceTest extends TestClass {

  // --- URL Construction Tests ---

  function testBuildUpstreamUrl() {
    var url = WeatherService.buildUpstreamUrl(40.7128, -74.006, "2025-06-15")
    assertTrue("URL should contain latitude", url.contains("latitude=40.7128"))
    assertTrue("URL should contain longitude", url.contains("longitude=-74.006"))
    assertTrue("URL should contain date", url.contains("start_date=2025-06-15"))
    assertTrue("URL should contain end_date", url.contains("end_date=2025-06-15"))
    assertTrue("URL should contain temperature_2m", url.contains("temperature_2m"))
    assertTrue("URL should contain precipitation_probability", url.contains("precipitation_probability"))
    assertTrue("URL should contain precipitation", url.contains("precipitation"))
    assertTrue("URL should contain wind_speed_10m", url.contains("wind_speed_10m"))
    assertTrue("URL should contain relative_humidity_2m", url.contains("relative_humidity_2m"))
    assertTrue("URL should use fahrenheit", url.contains("temperature_unit=fahrenheit"))
    assertTrue("URL should use mph", url.contains("wind_speed_unit=mph"))
    assertTrue("URL should use inch", url.contains("precipitation_unit=inch"))
  }

  function testBuildUpstreamUrlNegativeCoordinates() {
    var url = WeatherService.buildUpstreamUrl(-33.8688, -151.2093, "2025-06-15")
    assertTrue("URL should contain negative latitude", url.contains("latitude=-33.8688"))
    assertTrue("URL should contain negative longitude", url.contains("longitude=-151.2093"))
  }

  // --- Response Transformation Tests ---

  function testTransformResponse() {
    var upstream = buildSampleUpstreamJson(3)
    var result = WeatherService.transformResponse(upstream, 40.7128, -74.006, "2025-06-15")
    var json = new JSONObject(result)

    assertTrue("Result should have location", json.has("location"))
    assertTrue("Result should have date", json.has("date"))
    assertTrue("Result should have hourly", json.has("hourly"))

    var location = json.getJSONObject("location")
    assertEquals(40.7128, location.getDouble("latitude"), 0.0001)
    assertEquals(-74.006, location.getDouble("longitude"), 0.0001)

    assertEquals("2025-06-15", json.getString("date"))

    var hourly = json.getJSONArray("hourly")
    var firstHour = hourly.getJSONObject(0)
    assertTrue("Hour should have time", firstHour.has("time"))
    assertTrue("Hour should have temperature_f", firstHour.has("temperature_f"))
    assertTrue("Hour should have precipitation_probability_pct", firstHour.has("precipitation_probability_pct"))
    assertTrue("Hour should have precipitation_in", firstHour.has("precipitation_in"))
    assertTrue("Hour should have wind_speed_mph", firstHour.has("wind_speed_mph"))
    assertTrue("Hour should have relative_humidity_pct", firstHour.has("relative_humidity_pct"))
  }

  function testTransformResponseHourlyCount() {
    var upstream = buildSampleUpstreamJson(24)
    var result = WeatherService.transformResponse(upstream, 40.7128, -74.006, "2025-06-15")
    var json = new JSONObject(result)
    var hourly = json.getJSONArray("hourly")
    assertEquals("Should have 24 hourly entries", 24, hourly.length())
  }

  // --- Latitude Validation Tests ---

  function testValidateLatitudeValid() {
    // These should not throw
    WeatherService.validateLatitude(0)
    WeatherService.validateLatitude(45.0)
    WeatherService.validateLatitude(-90.0)
    WeatherService.validateLatitude(90.0)
  }

  function testValidateLatitudeInvalid() {
    try {
      WeatherService.validateLatitude(91.0)
      fail("Should have thrown IllegalArgumentException for latitude 91")
    } catch (ex : IllegalArgumentException) {
      assertTrue("Message should mention latitude", ex.getMessage().contains("latitude"))
    }

    try {
      WeatherService.validateLatitude(-91.0)
      fail("Should have thrown IllegalArgumentException for latitude -91")
    } catch (ex : IllegalArgumentException) {
      assertTrue("Message should mention latitude", ex.getMessage().contains("latitude"))
    }
  }

  // --- Longitude Validation Tests ---

  function testValidateLongitudeValid() {
    WeatherService.validateLongitude(0)
    WeatherService.validateLongitude(-180.0)
    WeatherService.validateLongitude(180.0)
  }

  function testValidateLongitudeInvalid() {
    try {
      WeatherService.validateLongitude(181.0)
      fail("Should have thrown IllegalArgumentException for longitude 181")
    } catch (ex : IllegalArgumentException) {
      assertTrue("Message should mention longitude", ex.getMessage().contains("longitude"))
    }

    try {
      WeatherService.validateLongitude(-181.0)
      fail("Should have thrown IllegalArgumentException for longitude -181")
    } catch (ex : IllegalArgumentException) {
      assertTrue("Message should mention longitude", ex.getMessage().contains("longitude"))
    }
  }

  // --- Date Validation Tests ---

  function testValidateDateValid() {
    // Should not throw
    WeatherService.validateDate("2025-06-15")
    WeatherService.validateDate("2025-01-01")
    WeatherService.validateDate("2025-12-31")
  }

  function testValidateDateInvalid() {
    assertDateInvalid("06/15/2025")
    assertDateInvalid("abc")
    assertDateInvalid("")
  }

  // --- Helper Methods ---

  private function assertDateInvalid(date : String) {
    try {
      WeatherService.validateDate(date)
      fail("Should have thrown IllegalArgumentException for date: " + date)
    } catch (ex : IllegalArgumentException) {
      assertTrue("Message should mention date", ex.getMessage().contains("date") || ex.getMessage().contains("Date"))
    }
  }

  private function buildSampleUpstreamJson(hours : int) : String {
    var times = new JSONArray()
    var temps = new JSONArray()
    var precipProbs = new JSONArray()
    var precips = new JSONArray()
    var winds = new JSONArray()
    var humidities = new JSONArray()

    for (i in 0..|hours) {
      var hourStr = (i < 10 ? "0" : "") + i
      times.put("2025-06-15T" + hourStr + ":00")
      temps.put(70.0 + i)
      precipProbs.put(10 + i)
      precips.put(0.0)
      winds.put(5.0 + i * 0.5)
      humidities.put(60 + i)
    }

    var hourly = new JSONObject()
    hourly.put("time", times)
    hourly.put("temperature_2m", temps)
    hourly.put("precipitation_probability", precipProbs)
    hourly.put("precipitation", precips)
    hourly.put("wind_speed_10m", winds)
    hourly.put("relative_humidity_2m", humidities)

    var upstream = new JSONObject()
    upstream.put("latitude", 40.710335)
    upstream.put("longitude", -73.99307)
    upstream.put("hourly", hourly)

    return upstream.toString()
  }
}
