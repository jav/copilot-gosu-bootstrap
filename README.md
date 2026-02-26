# Copilot Bootstrap: Build a Gosu Weather API with GitHub Copilot CLI

A hands-on tutorial for Guidewire developers to learn the **standalone GitHub Copilot CLI** with **Azure DevOps** integration via the `az` CLI. You will use Copilot to generate a complete Gosu REST API service — from project scaffolding to tests — guided by a work item pulled from ADO.

---

## What You Will Build

A REST API service in **Gosu** that returns weather forecast data. The service runs on Spark Java, queries the Open-Meteo public API, and returns curated hourly forecasts as JSON.

```
GET /api/weather/forecast?latitude=40.7128&longitude=-74.006&date=2025-06-15
```

## What You Will Learn

- Installing and authenticating the GitHub Copilot CLI
- Using the Azure CLI (`az`) to query Azure DevOps work items
- Feeding ADO work item requirements into Copilot prompts
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
| **Azure CLI (`az`)** | Latest version | `az version` |
| **Azure DevOps** | Access to an ADO organization with a project | — |

---

## Step 0: Clone This Repository

```bash
git clone https://github.com/your-org/copilot-bootstrap.git
cd copilot-bootstrap
```

Take a moment to read the docs:
- [`docs/specification.md`](docs/specification.md) — Full project spec

> **Gosu language guidance:** This repo includes [`.github/copilot-instructions.md`](.github/copilot-instructions.md) which teaches Copilot about Gosu syntax. The GitHub Copilot plugin for IntelliJ reads this file automatically so Copilot will prefer Gosu over Java when generating code in this project.

### Minimal bootstrap mode (README-only repository)

If your repo currently contains only this `README.md`, that is still enough to bootstrap the full project with Copilot.
After authenticating with `az`, fetch work item **1451532** from **if-it / mobility-CTP** using the `az boards` CLI, then feed the requirements into Copilot to generate all required project files (`build.gradle`, `settings.gradle`, `gradle.properties`, `src/main/gosu/weather/*`, `src/test/gosu/weather/*`, and Gradle wrapper files).

---

## Step 0.5: Verify `az` and Copilot CLI Availability

Before you start with Copilot prompts in this repo, confirm both CLIs are available:

```bash
az version
copilot --version
```

If `az` is not installed, use Scoop (preferred):

```bash
scoop install azure-cli
az version
```

You can also use the official Azure CLI install guidance:
- [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)

If you need to work in a specific Azure subscription context, set it explicitly:

```bash
az account list --output table
az account set --subscription "if-it"
az account show --query name --output tsv
```

For Mobility CTP work, switch to:

```bash
az account set --subscription "mobility-CTP"
az account show --query name --output tsv
```

If `copilot` is not found, continue to [Step 1](#step-1-install-the-github-copilot-cli).

### Optional: Add shared Copilot skills from Engineering

```bash
copilot
/plugin marketplace add https://if-it@dev.azure.com/if-it/mobility-CTP/_git/common-ai-adoption
/plugin install common-ai-adoption-skills@common-ai-adoption
/skills
```

### Guidewire/Gosu context to reuse in prompts

- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for strict Gosu generation rules (`.gs`, `uses`, `function`, `for...in`).
- [`docs/specification.md`](docs/specification.md) for the target architecture, dependencies, and test expectations.

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
copilot --version
```

You should see a version number printed.

---

## Step 2: Authenticate with GitHub

Start the Copilot CLI and authenticate:

```bash
copilot
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

## Step 3: Authenticate with Azure DevOps via the `az` CLI

The Azure CLI (`az`) lets you query ADO work items directly from the terminal. Copilot does not need a separate MCP server — you will fetch the work item with `az` and pass the requirements to Copilot.

### 3.1 Install the Azure CLI (if needed)

```bash
# Windows (Scoop)
scoop install azure-cli

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

See [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) for other options.

### 3.2 Log in and install the DevOps extension

```bash
az login
az extension add --name azure-devops
```

### 3.3 Configure your default organization and project

```bash
az devops configure --defaults organization=https://dev.azure.com/your-org project=your-project
```

### 3.4 Verify the connection

```bash
az boards work-item show --id 1 --output table
```

You should see work item details printed. If you get a permissions error, verify your account has access to the project.

---

## Step 4: Query ADO for Your Work Item

Use the `az` CLI to fetch the work item from ADO:

```bash
az boards work-item show --id 1451532 --output json
```

To see just the title and description:

```bash
az boards work-item show --id 1451532 --query "{title: fields.\"System.Title\", description: fields.\"System.Description\"}" --output json
```

Review the output and verify it describes:
- Endpoint: `GET /api/weather/forecast`
- Tech stack: Gosu + Spark Java + Gradle
- Upstream: Open-Meteo API

Now feed the requirements into Copilot. Copy the work item output and prompt:

```
Here are the requirements from our ADO work item:

<paste the az output here>

Summarize these requirements before we start generating code.
```

---

## Step 5: Scaffold the Gosu Gradle Project

Now use Copilot to generate the project structure.

Prompt Copilot:

```
Based on the ADO work item requirements, scaffold a Gradle project for the Gosu
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

### `az boards` commands failing

- Run `az login` to refresh your session if it has expired
- Verify your defaults: `az devops configure --list`
- Check that the organization and project names are correct
- Ensure the DevOps extension is installed: `az extension add --name azure-devops`
- Test with a known work item ID: `az boards work-item show --id 1 --output table`

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
| `step/02-configure-ado-mcp` | `reference/mcp-config-example.json` (legacy — `az` CLI needs no config file) |
| `step/03-query-work-item` | `reference/expected-query-output.md` |
| `step/04-scaffold-project` | `reference/build.gradle`, `settings.gradle`, `gradle.properties`, empty src dirs |
| `step/05-generate-service` | `reference/src/main/gosu/weather/WeatherService.gs`, `WeatherApp.gs` |
| `step/06-tests-and-run` | `reference/src/test/gosu/weather/WeatherServiceTest.gs`, test harness |

---

## Resources

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line)
- [Azure CLI Documentation](https://learn.microsoft.com/cli/azure/)
- [Azure DevOps CLI Extension](https://learn.microsoft.com/azure/devops/cli/)
- [Gosu Language](https://gosu-lang.github.io/)
- [Gosu Gradle Plugin](https://github.com/niclasr/gosu-gradle-plugin)
- [Spark Java Framework](https://sparkjava.com/)
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [Full Project Specification](docs/specification.md)
