# ioBroker MCP Server

> **Built with Vibe Coding** - This project was developed using advanced AI-assisted coding techniques for optimal performance and maintainability.

A comprehensive MCP (Model Context Protocol) server for integrating ioBroker with AI assistants like Claude/Cursor.

## Overview

This project provides a standalone MCP server that communicates with ioBroker via REST API. The server enables AI assistants to gain full access to ioBroker functionalities.

## Main Components

- **`/standalone-mcp-server/`** - The functional MCP server
  - Standalone Node.js application
  - Communicates with ioBroker via REST API
  - No installation as ioBroker adapter required
  - Intelligent timezone handling
  - Robust error handling

- **`/docs/`** - Project documentation
  - Concepts and background information
  - Configuration guides

## Documentation

- **[RULES.md](./RULES.md)** - Usage rules and best practices for the MCP server
- **[IOBROKER_SCRIPT_EXAMPLES.md](./IOBROKER_SCRIPT_EXAMPLES.md)** - Practical examples for ioBroker script development
- **[docs/iobroker_objects.md](./docs/iobroker_objects.md)** - Detailed description of ioBroker object structure
- **[/standalone-mcp-server/README.md](./standalone-mcp-server/README.md)** - Detailed installation guide
- **[/standalone-mcp-server/CURSOR_SETUP.md](./standalone-mcp-server/CURSOR_SETUP.md)** - Cursor-specific setup

## Installation and Usage

For detailed installation and configuration instructions, see:
- [`/standalone-mcp-server/README.md`](./standalone-mcp-server/README.md) - Main guide
- [`/standalone-mcp-server/CURSOR_SETUP.md`](./standalone-mcp-server/CURSOR_SETUP.md) - Cursor-specific setup

## Quick Start

```bash
cd standalone-mcp-server
npm install
cp .env.example .env
# Edit .env with your ioBroker settings
npm run build
npm start
```

## MCP Tools Status

### ✅ **Working Tools (9/13)**

#### **Core State Operations**
- **`getState`** ✅ - Read a single state
- **`setState`** ✅ - Write a state value with acknowledgment
- **`getStates`** ✅ - Read multiple states with pattern matching

#### **Object Management**
- **`getObject`** ✅ - Get detailed object information
- **`getObjects`** ✅ - Get multiple objects with pattern and type filtering

#### **Historical Data**
- **`getHistory`** ✅ - Historical data with intelligent timezone handling
  - Supports relative time formats: "5m", "2h", "3d", "1w"
  - Supports ISO date strings: "2025-08-16T10:00:00"
  - Automatic local timezone detection and conversion
  - Flexible aggregation options (min, max, avg, sum, count, onchange)

#### **Adapter Control**
- **`sendTo`** ✅ - Send commands to adapters
  - Adapter restart/start/stop functionality
  - General message sending to adapter instances
- **`startScript`** ✅ - Start JavaScript scripts with adapter status checking

#### **File Operations**
- **`writeFile`** ✅ - Write files to ioBroker adapters with base64 encoding

#### **System Operations**
- **`logMessage`** ✅ - Add log entries to ioBroker

### ❌ **Non-working Tools (4/13)**

#### **File Operations**
- **`readFile`** ❌ - "Not exists" (Status: 500)
  - **Problem:** File doesn't exist or path is incorrect
  - **Solution:** Use valid file paths or better error handling

#### **System Operations**
- **`readLogs`** ❌ - "no file loggers" (Status: 500)
  - **Problem:** ioBroker not configured for file logging
  - **Solution:** Configure ioBroker or disable tool

#### **Adapter Control**
- **`sendTo` (for other commands)** ❌ - Timeout (30s) for certain commands
  - **Problem:** Certain commands (like `getScripts`) timeout
  - **Solution:** Increase timeout or command-specific handling

#### **Script Management**
- **`startScript`** ❌ - "javascript.0 adapter is not running"
  - **Problem:** JavaScript adapter is not running
  - **Solution:** Start adapter or adapt tool for non-running adapters

## Special Features

### **Intelligent Timezone Handling**
- Automatic detection of local timezone
- Flexible input formats (relative times, ISO dates)
- Consistent output in local timezone
- UTC conversion for API calls

### **Robust Error Handling**
- Comprehensive error reporting
- Fallback mechanisms for critical operations
- User-friendly error messages

### **Performance Optimizations**
- Optimized adapter restart logic
- Efficient history queries
- Reduced API latency

## Prerequisites

- Node.js 18 or higher
- ioBroker with REST API enabled
- ioBroker History adapter (for historical data queries)
- Network access to ioBroker instance

## Known Issues & Solutions

### **Adapter Restarts Take 1-2 Minutes**
- **Cause:** Complex adapters with many connected devices
- **Solution:** Normal behavior for network adapters (Shelly, etc.)

### **"no file loggers" Error**
- **Cause:** ioBroker not configured for file logging
- **Solution:** Configure ioBroker or disable tool

### **"Not exists" with readFile**
- **Cause:** File doesn't exist or adapter not accessible
- **Solution:** Use valid adapter instances (e.g., `admin.0`)

## License

MIT License - see [LICENSE](LICENSE) file for details. 