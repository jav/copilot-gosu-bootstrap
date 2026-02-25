package weather

uses spark.Spark
uses spark.Request
uses spark.Response
uses spark.Route
uses java.time.LocalDate
uses org.json.JSONObject

class WeatherApp {

  static function main(args : String[]) {
    setupRoutes()
  }

  static function setupRoutes() {
    Spark.port(4567)

    Spark.get("/api/weather/forecast", new Route() {
      override function handle(req : Request, res : Response) : Object {
        res.type("application/json")

        try {
          var latStr = req.queryParams("latitude")
          var lonStr = req.queryParams("longitude")
          var dateStr = req.queryParams("date")

          var lat = latStr != null ? Double.parseDouble(latStr) : 40.7128
          var lon = lonStr != null ? Double.parseDouble(lonStr) : -74.0060

          var date : String
          if (dateStr == null || dateStr.isEmpty()) {
            date = LocalDate.now().toString()
          } else {
            date = dateStr
          }

          return WeatherService.fetchForecast(lat, lon, date)
        } catch (ex : IllegalArgumentException) {
          res.status(400)
          return new JSONObject().put("error", ex.getMessage()).toString()
        } catch (ex : NumberFormatException) {
          res.status(400)
          return new JSONObject().put("error", "Invalid numeric parameter: " + ex.getMessage()).toString()
        } catch (ex : Exception) {
          res.status(502)
          return new JSONObject().put("error", "Failed to fetch forecast from upstream API").toString()
        }
      }
    })
  }
}
