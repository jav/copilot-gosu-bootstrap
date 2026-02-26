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

# Part 1: Setup — Do This Yourself

Complete these steps before launching Copilot.

## Prerequisites

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

## 1. Clone This Repository

```bash
git clone https://github.com/your-org/copilot-bootstrap.git
cd copilot-bootstrap
```

> **Gosu language guidance:** This repo includes [`.github/copilot-instructions.md`](.github/copilot-instructions.md) which teaches Copilot about Gosu syntax. The GitHub Copilot plugin for IntelliJ reads this file automatically so Copilot will prefer Gosu over Java when generating code in this project.

## 2. Install and Configure the Azure CLI

### Install `az` (if needed)

```bash
# Windows (Scoop — preferred)
scoop install azure-cli

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

See [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) for other options.

### Log in and install the DevOps extension

```bash
az login
az extension add --name azure-devops
```

### Configure your default organization and project

```bash
az devops configure --defaults organization=https://dev.azure.com/if-it project=mobility-CTP
```

### Verify the connection

```bash
az boards work-item show --id 1451532 --output table
```

You should see work item details printed. If you get a permissions error, verify your account has access to the project.

## 3. Install and Authenticate the Copilot CLI

### Install via GitHub CLI extension

```bash
gh extension install github/gh-copilot
```

> **Note:** Check [GitHub Copilot CLI docs](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line) for the latest installation method.

### Verify installation

```bash
copilot --version
```

### Authenticate

Start the Copilot CLI and authenticate:

```bash
copilot
```

If prompted, log in with your GitHub credentials. The CLI will open a browser for OAuth authentication.

Alternatively, set a GitHub token as an environment variable:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

Verify by asking Copilot a simple question:

```
What version of Java is installed on this machine?
```

---

**You are now ready. Open Copilot and give it the task below.**

---

# Part 2: Task for Copilot

> **This section is written as instructions for Copilot.** Copy the block below into your Copilot session, or simply tell Copilot to read this README and follow the task.

---

### Step 1: Fetch Requirements from Azure DevOps

Run the following command to retrieve the work item that describes what to build:

```bash
az boards work-item show --id 1451532 --output json
```

> ADO org: **if-it** · Project: **mobility-CTP**

Read and summarize the work item requirements before proceeding.

### Step 2: Research the Open-Meteo API

Visit [open-meteo.com](https://open-meteo.com) (or use web search) to understand:
- The forecast endpoint URL and query parameters
- How to request hourly weather variables (temperature, precipitation, wind speed, humidity)
- How to specify imperial units (Fahrenheit, mph, inches)

### Step 3: Generate the Complete Gosu Project

Based on the ADO work item requirements and your Open-Meteo research, generate the entire project:
- Gradle build files (`build.gradle`, `settings.gradle`, `gradle.properties`, Gradle wrapper)
- Application source under `src/main/gosu/weather/`
- Tests under `src/test/gosu/weather/`

### Rules

- **Do NOT read `docs/specification.md`** — derive all requirements from the ADO work item and your own research.
- Tools available: `az` CLI, shell, file creation, web search.

### Definition of Done

All three must pass:

1. **Build succeeds:**
   ```bash
   ./gradlew build
   ```

2. **Tests pass:**
   ```bash
   ./gradlew test
   ```

3. **API returns valid JSON:**
   ```bash
   ./gradlew run &
   sleep 3
   curl http://localhost:4567/api/weather/forecast
   ```
   The response should contain `location`, `date`, and an `hourly` array with weather data.

---

## Hints (if Copilot gets stuck)

<details>
<summary>Click to expand hints</summary>

- **Gosu, not Java** — The project uses Gosu (`.gs` files), not Java. See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for Gosu syntax rules.
- **Gradle plugin** — Use `org.gosu-lang.gosu` as the Gradle plugin ID.
- **HTTP framework** — Use Spark Java (`com.sparkjava:spark-core:2.9.4`) on port 4567.
- **Test base class** — Tests should extend `gw.test.TestClass` from `gosu-test-api`.

</details>

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
| `step/02-configure-ado` | Checkpoint — `az` CLI configured |
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
