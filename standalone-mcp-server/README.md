# Standalone MCP Server for ioBroker

A comprehensive MCP (Model Context Protocol) server that connects to ioBroker via REST API, providing full access to ioBroker functionality from AI assistants.

## Features

- **No ioBroker adapter installation required** - Works as standalone server
- **Full ioBroker integration** - Access to states, objects, history, files, and adapter control
- **Intelligent timezone handling** - Automatic local timezone detection and conversion
- **Robust error handling** - Comprehensive error reporting and fallback mechanisms
- **Simple configuration** - Environment-based setup
- **Real-time data access** - History queries with flexible time formats

## Prerequisites

- Node.js 18 or higher
- ioBroker with REST API enabled
- Network access to ioBroker instance
- ioBroker history adapter (for historical data queries)

## Installation

```bash
# Clone or download this folder
cd standalone-mcp-server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your ioBroker settings
```

## Configuration

Edit `.env` file:

```env
IOBROKER_HOST=192.168.1.19
IOBROKER_PORT=8087
IOBROKER_PROTOCOL=http
```

## Usage

### Direct usage with stdio:

```bash
npm run build
npm start
```

### With MCP Inspector:

```bash
npx @modelcontextprotocol/inspector npm start
```

### With Cursor:

Add to Cursor MCP settings:

```json
{
  "mcpServers": {
    "iobroker": {
      "command": "node",
      "args": ["C:/path/to/standalone-mcp-server/dist/index.js"]
    }
  }
}
```

## Available Tools

### Core State Operations
- **`getState`** - Read a single state value
- **`setState`** - Write a state value with acknowledgment
- **`getStates`** - Read multiple states with pattern matching

### Object Management
- **`getObject`** - Get detailed object information
- **`getObjects`** - Get multiple objects with pattern and type filtering

### Historical Data
- **`getHistory`** - Query historical data with intelligent timezone handling
  - Supports relative time formats: "5m", "2h", "3d", "1w"
  - Supports ISO date strings: "2025-08-16T10:00:00"
  - Automatic local timezone detection and conversion
  - Flexible aggregation options (min, max, avg, sum, count, onchange)

### Adapter Control
- **`sendTo`** - Send commands to adapters
  - Adapter restart/start/stop functionality
  - General message sending to adapter instances
- **`startScript`** - Start JavaScript scripts with adapter status checking

### File Operations
- **`readFile`** - Read files from ioBroker adapters
- **`writeFile`** - Write files to ioBroker adapters with base64 encoding

### System Operations
- **`logMessage`** - Add log entries to ioBroker
- **`readLogs`** - Read log file information (requires file logger configuration)

## Time Handling

The server provides intelligent timezone handling:

- **Automatic Detection**: Uses system timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`)
- **Input Flexibility**: Accepts relative times ("35m", "2h") and ISO dates
- **Output Consistency**: All timestamps displayed in local timezone
- **UTC Conversion**: Internal API calls use UTC, display uses local time

## Examples

### Query recent sensor data:
```
getHistory for tuya.0.bf7200ddef31e2095bgr46.106, last 35 minutes
```

### Restart an adapter:
```
sendTo shelly.0 with command restart
```

### Read system states:
```
getStates with pattern system.adapter.admin.0.*
```

## Limitations

Compared to the full adapter approach, this standalone server:
- Cannot subscribe to state changes (no real-time events)
- Has higher latency due to HTTP overhead
- Requires REST API to be enabled and accessible
- Some operations depend on ioBroker configuration (file logging, history adapter)

## Troubleshooting

### Common Issues:
- **"no file loggers"**: ioBroker not configured for file logging
- **"Not exists"**: File path doesn't exist or adapter not accessible
- **"javascript.0 adapter is not running"**: JavaScript adapter needs to be started
- **Timeout errors**: Complex operations may take longer than 30 seconds

### Performance Notes:
- Adapter restarts may take 1-2 minutes for complex adapters
- History queries are optimized for reasonable time ranges
- File operations work best with valid adapter instances

## When to Use

This standalone approach is ideal when:
- You need comprehensive ioBroker access from AI assistants
- You don't want to modify your ioBroker installation
- You need historical data analysis capabilities
- You want to control adapters and scripts remotely
- You're building AI-powered home automation workflows 