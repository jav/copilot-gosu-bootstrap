package weather

uses java.net.URI
uses java.net.http.HttpClient
uses java.net.http.HttpRequest
uses java.net.http.HttpResponse
uses java.time.LocalDate
uses java.time.format.DateTimeFormatter
uses java.time.format.DateTimeParseException
uses org.json.JSONObject
uses org.json.JSONArray

class WeatherService {

  static final var HOURLY_VARIABLES : String = "temperature_2m,precipitation_probability,precipitation,wind_speed_10m,relative_humidity_2m"

  static function fetchForecast(lat : double, lon : double, date : String) : String {
    validateLatitude(lat)
    validateLongitude(lon)
    validateDate(date)
    var url = buildUpstreamUrl(lat, lon, date)
    var responseBody = callUpstreamApi(url)
    return transformResponse(responseBody, lat, lon, date)
  }

  static function buildUpstreamUrl(lat : double, lon : double, date : String) : String {
    return "https://api.open-meteo.com/v1/forecast"
        + "?latitude=" + lat
        + "&longitude=" + lon
        + "&hourly=" + HOURLY_VARIABLES
        + "&start_date=" + date
        + "&end_date=" + date
        + "&temperature_unit=fahrenheit"
        + "&wind_speed_unit=mph"
        + "&precipitation_unit=inch"
  }

  static function callUpstreamApi(url : String) : String {
    var client = HttpClient.newHttpClient()
    var request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .GET()
        .build()
    var response = client.send(request, HttpResponse.BodyHandlers.ofString())
    if (response.statusCode() != 200) {
      throw new RuntimeException("Upstream API returned status " + response.statusCode())
    }
    return response.body()
  }

  static function transformResponse(upstreamJson : String, lat : double, lon : double, date : String) : String {
    var upstream = new JSONObject(upstreamJson)
    var hourlyData = upstream.getJSONObject("hourly")
    var times = hourlyData.getJSONArray("time")
    var temps = hourlyData.getJSONArray("temperature_2m")
    var precipProbs = hourlyData.getJSONArray("precipitation_probability")
    var precips = hourlyData.getJSONArray("precipitation")
    var winds = hourlyData.getJSONArray("wind_speed_10m")
    var humidities = hourlyData.getJSONArray("relative_humidity_2m")

    var hourlyArray = new JSONArray()
    for (i in 0..|times.length()) {
      var entry = new JSONObject()
      entry.put("time", times.getString(i))
      entry.put("temperature_f", temps.getDouble(i))
      entry.put("precipitation_probability_pct", precipProbs.getInt(i))
      entry.put("precipitation_in", precips.getDouble(i))
      entry.put("wind_speed_mph", winds.getDouble(i))
      entry.put("relative_humidity_pct", humidities.getInt(i))
      hourlyArray.put(entry)
    }

    var location = new JSONObject()
    location.put("latitude", lat)
    location.put("longitude", lon)

    var result = new JSONObject()
    result.put("location", location)
    result.put("date", date)
    result.put("hourly", hourlyArray)

    return result.toString(2)
  }

  static function validateLatitude(lat : double) {
    if (lat < -90 || lat > 90) {
      throw new IllegalArgumentException("Invalid latitude: must be between -90 and 90")
    }
  }

  static function validateLongitude(lon : double) {
    if (lon < -180 || lon > 180) {
      throw new IllegalArgumentException("Invalid longitude: must be between -180 and 180")
    }
  }

  static function validateDate(date : String) {
    try {
      LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE)
    } catch (ex : DateTimeParseException) {
      throw new IllegalArgumentException("Invalid date format: must be YYYY-MM-DD")
    }
  }
}
