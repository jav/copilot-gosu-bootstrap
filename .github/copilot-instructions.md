# Copilot Instructions — Gosu Weather API

This project uses the **Gosu** programming language (a JVM language). **DO NOT generate Java.** All source code must be written in Gosu (`.gs` files).

## Gosu Syntax Reference

### File structure

```gosu
package weather

uses java.net.URI
uses java.net.http.HttpClient
uses org.json.JSONObject

class MyClass {
  // class body
}
```

- Use `uses` instead of `import`.
- File extension is `.gs`, not `.java`.
- Source directory: `src/main/gosu/` (not `src/main/java/`).
- Test directory: `src/test/gosu/` (not `src/test/java/`).

### Variable declarations

```gosu
var name = "value"                     // type-inferred
var name : String = "value"            // explicit type
static final var CONSTANT : String = "value"  // constant
```

### Methods (functions)

Use the `function` keyword. Parameters use `param : Type` syntax (space before colon). Return types follow the parameter list with ` : ReturnType`.

```gosu
static function fetchData(lat : double, lon : double, date : String) : String {
  // body
}

function validate(value : double) {
  // no return type means void
}
```

### For loops — range syntax

Gosu uses `for...in` with `0..|n` for index-based iteration. The `|` means exclusive upper bound.

```gosu
for (i in 0..|items.length()) {
  var item = items.get(i)
}
```

**Do NOT use** C-style `for (int i = 0; i < n; i++)` loops.

### String handling

Gosu does **not** support string interpolation. Use concatenation:

```gosu
var url = "https://api.example.com"
    + "?latitude=" + lat
    + "&longitude=" + lon
```

### Anonymous classes

Used for implementing interfaces like Spark's `Route`:

```gosu
Spark.get("/path", new Route() {
  override function handle(req : Request, res : Response) : Object {
    // handler body
  }
})
```

### Exception handling

```gosu
try {
  // code
} catch (ex : NumberFormatException) {
  // handle
} catch (ex : IllegalArgumentException) {
  // handle
} catch (ex : Exception) {
  // catch-all
}
```

Note: `NumberFormatException` extends `IllegalArgumentException`, so catch it first.

### Null handling

```gosu
var lat = latStr != null ? Double.parseDouble(latStr) : 40.7128
```

## Common Patterns in This Project

### HTTP client (java.net.http)

```gosu
uses java.net.URI
uses java.net.http.HttpClient
uses java.net.http.HttpRequest
uses java.net.http.HttpResponse

var client = HttpClient.newHttpClient()
var request = HttpRequest.newBuilder()
    .uri(URI.create(url))
    .GET()
    .build()
var response = client.send(request, HttpResponse.BodyHandlers.ofString())
```

### JSON handling (org.json)

```gosu
uses org.json.JSONObject
uses org.json.JSONArray

var json = new JSONObject(responseBody)
var array = json.getJSONArray("items")
var obj = new JSONObject()
obj.put("key", value)
```

### Spark Java routes

```gosu
uses spark.Spark
uses spark.Request
uses spark.Response
uses spark.Route

Spark.port(4567)
Spark.get("/api/path", new Route() {
  override function handle(req : Request, res : Response) : Object {
    res.type("application/json")
    var param = req.queryParams("name")
    return result
  }
})
```

### Test classes

Tests extend `gw.test.TestClass` and use JUnit-style assertions:

```gosu
uses gw.test.TestClass

class MyServiceTest extends TestClass {

  function testSomething() {
    var result = MyService.doSomething()
    assertEquals("expected", result)
    assertTrue("should be true", condition)
  }
}
```

## Build Configuration

- Gradle plugin: `org.gosu-lang.gosu`
- Dependencies: `gosu-core`, `gosu-core-api`, `gosu-test-api`
- Application plugin for `main` class
- Java 11 compatibility
