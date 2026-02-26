# Copilot Bootstrap: Build a Gosu Weather API with GitHub Copilot CLI

A hands-on tutorial for Guidewire developers to learn the **standalone GitHub Copilot CLI** with **Azure DevOps MCP** integration. You will use Copilot to generate a complete Gosu REST API service — from project scaffolding to tests — guided by a work item pulled from ADO.

---

## What You Will Build

A REST API service in **Gosu** that returns weather forecast data. The service runs on Spark Java, queries the Open-Meteo public API, and returns curated hourly forecasts as JSON.

```
GET /api/weather/forecast?latitude=40.7128&longitude=-74.006&date=2025-06-15
```

## What You Will Learn

- Installing and authenticating the GitHub Copilot CLI
- Configuring an MCP server to connect Copilot to Azure DevOps
- Querying ADO work items through natural language prompts
- Using Copilot to scaffold a Gradle + Gosu project from scratch
- Generating application code and tests with AI assistance
- Iterating on Copilot output until the project builds and runs

---

## Prerequisites

Before starting, ensure you have:

| Requirement | Version | Check |
|-------------|---------|-------|
| **Node.js** | 22 or higher | `node --version` |
| **Java** | 11 or higher (OpenJDK recommended) | `java --version` |
| **git** | Any recent version | `git --version` |
| **IntelliJ IDEA** | 2024.1.5 or higher | — |
| **GitHub Copilot plugin** | Installed in IntelliJ | IntelliJ → Settings → Plugins → "GitHub Copilot" |
| **GitHub account** | With Copilot subscription (Individual, Business, or Enterprise) | — |
| **Azure DevOps** | Access to an ADO organization with a project | — |
| **ADO Personal Access Token** | With Work Items (Read) scope | See [Step 3](#step-3-configure-the-azure-devops-mcp-server) |

---

## Step 0: Clone This Repository

```bash
git clone https://github.com/your-org/copilot-bootstrap.git
cd copilot-bootstrap
```

Take a moment to read the docs:
- [`docs/specification.md`](docs/specification.md) — Full project spec
- [`docs/ado-work-item.md`](docs/ado-work-item.md) — The work item you will query from ADO

> **Gosu language guidance:** This repo includes [`.github/copilot-instructions.md`](.github/copilot-instructions.md) which teaches Copilot about Gosu syntax. The GitHub Copilot plugin for IntelliJ reads this file automatically so Copilot will prefer Gosu over Java when generating code in this project.

---

## Step 1: Install the GitHub Copilot CLI

The GitHub Copilot CLI is a standalone terminal tool (separate from VS Code).

### Install via GitHub CLI extension

```bash
gh extension install github/gh-copilot
```

> **Note:** Check [GitHub Copilot CLI docs](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line) for the latest installation method.

### Verify installation

```bash
gh copilot --version
```

You should see a version number printed.

---

## Step 2: Authenticate with GitHub

Start the Copilot CLI and authenticate:

```bash
gh copilot
```

If prompted, log in with your GitHub credentials. The CLI will open a browser for OAuth authentication.

Alternatively, set a GitHub token as an environment variable:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

### Verify authentication

Ask Copilot a simple question to confirm it is working:

```
What version of Java is installed on this machine?
```

---

## Step 3: Configure the Azure DevOps MCP Server

MCP (Model Context Protocol) servers let Copilot access external tools. You will configure the Azure DevOps MCP server so Copilot can read work items from your ADO project.

### 3.1 Create an ADO Personal Access Token

1. Go to `https://dev.azure.com/{your-org}/_usersSettings/tokens`
2. Click **New Token**
3. Set a name (e.g., `copilot-mcp`)
4. Set expiration as needed
5. Under **Scopes**, select **Work Items → Read**
6. Click **Create** and copy the token

### 3.2 Add the MCP server to Copilot

In your Copilot CLI session, run:

```
/mcp add ado-server https://github.com/microsoft/azure-devops-mcp -- \
  --organization your-org \
  --project your-project \
  --token YOUR_ADO_PAT
```

> **Note:** The exact MCP server URL and flags may vary. Consult the [Azure DevOps MCP server documentation](https://github.com/microsoft/azure-devops-mcp) for the latest setup instructions.

### 3.3 Verify the connection

Ask Copilot:

```
List the available MCP tools.
```

You should see ADO-related tools like `get_work_item`, `search_work_items`, etc.

---

## Step 4: Query ADO for Your Work Item

Before this step, ensure the work item from [`docs/ado-work-item.md`](docs/ado-work-item.md) has been created in your ADO project.

Prompt Copilot:

```
Search ADO for a user story about building a weather forecast API service in Gosu.
Read the full work item and summarize the requirements.
```

Copilot will use the MCP server to query ADO and return the work item details. Verify it found the correct story with:
- Endpoint: `GET /api/weather/forecast`
- Tech stack: Gosu + Spark Java + Gradle
- Upstream: Open-Meteo API

---

## Step 5: Scaffold the Gosu Gradle Project

Now use Copilot to generate the project structure.

Prompt Copilot:

```
Based on the ADO work item you just read, scaffold a Gradle project for the Gosu
weather API service. Create:
- build.gradle with the org.gosu-lang.gosu plugin, Spark Java, and org.json dependencies
- settings.gradle
- gradle.properties with the Gosu version
- The directory structure under src/main/gosu/weather/ and src/test/gosu/weather/

Use the Gradle wrapper so the project is self-contained.
```

### Expected output

Copilot should create files matching this structure:

```
weather-api/
├── build.gradle
├── settings.gradle
├── gradle.properties
├── src/main/gosu/weather/       (empty, ready for source files)
└── src/test/gosu/weather/       (empty, ready for tests)
```

### Verify

```bash
cd weather-api
./gradlew build
```

The build should succeed (no source files yet, but the project compiles).

> **Checkpoint:** Compare your output with `git diff main..step/04-scaffold-project -- reference/`

---

## Step 6: Generate the Weather Service

Prompt Copilot to generate the application code:

```
Based on the ADO work item requirements, generate the Gosu source files:

1. WeatherService.gs — A service class with methods to:
   - Validate latitude, longitude, and date parameters
   - Build the Open-Meteo API URL
   - Call the upstream API using java.net.http.HttpClient
   - Transform the upstream response into our API's JSON format

2. WeatherApp.gs — The main application class that:
   - Starts Spark Java on port 4567
   - Defines the GET /api/weather/forecast route
   - Extracts query parameters with defaults (NYC coordinates, today's date)
   - Calls WeatherService and returns the result
   - Handles errors (400 for bad params, 502 for upstream failures)

Place files in src/main/gosu/weather/.
```

### Verify

```bash
./gradlew build
```

If the build fails, share the error with Copilot and ask it to fix the issue.

Then start the server and test:

```bash
./gradlew run &
sleep 3

# Default request (NYC, today)
curl http://localhost:4567/api/weather/forecast

# Custom location
curl "http://localhost:4567/api/weather/forecast?latitude=34.0522&longitude=-118.2437&date=2025-06-20"

# Error case
curl -w "\n%{http_code}" "http://localhost:4567/api/weather/forecast?latitude=999"
```

> **Checkpoint:** Compare with `git diff main..step/05-generate-service -- reference/`

---

## Step 7: Generate Tests and Test Harness

Prompt Copilot:

```
Generate unit tests for the WeatherService class in src/test/gosu/weather/WeatherServiceTest.gs.

The test class should extend gw.test.TestClass and cover:
- URL construction with correct parameters and hourly variables
- URL handling of negative coordinates
- Response transformation from upstream JSON to our format
- Hourly array count (24 entries for a full day)
- Latitude validation (valid and invalid values)
- Longitude validation (valid and invalid values)
- Date format validation (valid and invalid formats)

Also create a test harness that starts the server, sends real HTTP requests,
and validates the responses.
```

### Run the tests

```bash
./gradlew test
```

All tests should pass. If any fail, share the output with Copilot and iterate.

> **Checkpoint:** Compare with `git diff main..step/06-tests-and-run -- reference/`

---

## Tips and Troubleshooting

### Copilot produces Java instead of Gosu

This repo includes [`.github/copilot-instructions.md`](.github/copilot-instructions.md) which teaches Copilot about Gosu syntax. The GitHub Copilot plugin for IntelliJ reads this file automatically. If you are using the CLI instead, you can reference it explicitly:

```
@workspace Use the Gosu language conventions described in .github/copilot-instructions.md.
Rewrite this in Gosu (.gs files), not Java.
```

You can also re-prompt with explicit instructions:

```
Rewrite this in Gosu (.gs files), not Java. Use Gosu syntax:
var declarations, uses statements, function keyword for methods,
and place files under src/main/gosu/.
```

### Gradle build fails with "Could not find gosu plugin"

Ensure your `build.gradle` includes the plugin with the correct ID:

```groovy
plugins {
    id 'org.gosu-lang.gosu' version '8.0.1'
}
```

And that `mavenCentral()` is in your repositories block.

### Spark server fails to start

- Check that port 4567 is not already in use: `lsof -i :4567`
- Ensure `slf4j-simple` is in your dependencies (Spark requires an SLF4J binding)

### ADO MCP server not connecting

- Verify your PAT has not expired
- Check that the organization and project names are correct
- Try: `/mcp list` to see configured servers
- Try: `/mcp remove ado-server` and re-add

### Open-Meteo API returns errors

- The API is free and does not require authentication
- Ensure date format is `YYYY-MM-DD`
- Check that latitude is -90 to 90 and longitude is -180 to 180

---

## Step Branch Checkpoints

Each step of this tutorial has a corresponding branch with reference files under `reference/`. Use these to compare your progress:

```bash
# See what files a step branch adds
git diff main..step/04-scaffold-project -- reference/

# Check out a step branch to browse reference files
git checkout step/04-scaffold-project
ls reference/

# Return to main
git checkout main
```

| Branch | What it adds |
|--------|-------------|
| `step/00-prerequisites` | Checkpoint only (no reference files) |
| `step/01-install-copilot` | Checkpoint only (no reference files) |
| `step/02-configure-ado-mcp` | `reference/mcp-config-example.json` |
| `step/03-query-work-item` | `reference/expected-query-output.md` |
| `step/04-scaffold-project` | `reference/build.gradle`, `settings.gradle`, `gradle.properties`, empty src dirs |
| `step/05-generate-service` | `reference/src/main/gosu/weather/WeatherService.gs`, `WeatherApp.gs` |
| `step/06-tests-and-run` | `reference/src/test/gosu/weather/WeatherServiceTest.gs`, test harness |

---

## Resources

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Azure DevOps MCP Server](https://github.com/microsoft/azure-devops-mcp)
- [Gosu Language](https://gosu-lang.github.io/)
- [Gosu Gradle Plugin](https://github.com/niclasr/gosu-gradle-plugin)
- [Spark Java Framework](https://sparkjava.com/)
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [Full Project Specification](docs/specification.md)
