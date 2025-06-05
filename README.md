# ioBroker MCP-Server Adapter

[![NPM version](https://img.shields.io/npm/v/iobroker.mcp-server.svg)](https://www.npmjs.com/package/iobroker.mcp-server)
[![Downloads](https://img.shields.io/npm/dm/iobroker.mcp-server.svg)](https://www.npmjs.com/package/iobroker.mcp-server)
![Number of Installations](https://iobroker.live/badges/mcp-server-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/mcp-server-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.mcp-server.png?downloads=true)](https://nodei.co/npm/iobroker.mcp-server/)

## ioBroker MCP-Server Adapter

This adapter provides a Model Context Protocol (MCP) server for ioBroker, enabling AI assistants like Claude Desktop or Cursor to interact with your ioBroker installation.

## Overview

The MCP-Server adapter allows AI assistants to:
- Read and write ioBroker states
- Manage objects and devices
- Control adapter instances
- Access system information
- Execute ioBroker commands

## Features

### State Management
- `iobroker_getState` - Get the value of an ioBroker state
- `iobroker_setState` - Set the value of an ioBroker state
- `iobroker_getStates` - Get multiple states matching a pattern
- `iobroker_subscribeState` - Subscribe to state changes
- `iobroker_deleteState` - Delete a state

### Object Management
- `iobroker_getObject` - Get an ioBroker object
- `iobroker_getObjectList` - List ioBroker objects
- `iobroker_createObject` - Create a new object
- `iobroker_updateObject` - Update an existing object
- `iobroker_deleteObject` - Delete an object

### Adapter Control
- `iobroker_getAdapterInstances` - List all adapter instances
- `iobroker_controlAdapter` - Start/stop/restart adapter instances
- `iobroker_getAdapterConfig` - Get adapter configuration
- `iobroker_updateAdapterConfig` - Update adapter configuration
- `iobroker_getAdapterLogs` - Get adapter logs

### System Information
- `iobroker_getSystemInfo` - Get system information
- `iobroker_getSystemStats` - Get system statistics
- `iobroker_getInstalledAdapters` - List installed adapters
- `iobroker_getSystemHosts` - List system hosts
- `iobroker_executeCommand` - Execute ioBroker commands

## Installation

1. Install the adapter through the ioBroker admin interface or using the command line:
   ```bash
   iobroker add mcp-server
   ```

2. Configure the adapter in the admin interface

3. Install mcp-proxy on your Windows machine (for remote access):
   ```bash
   pip install mcp-proxy
   ```

## Configuration

### Adapter Settings

- **Server Port**: Port for the MCP server (default: 8932)
- **Enable Proxy**: Enable MCP proxy for remote access
- **Proxy Port**: Port for the MCP proxy (default: 8933)
- **Authentication**: Enable API key authentication
- **API Key**: API key for authentication
- **Enabled Tools**: Select which tool categories to enable

### Cursor Configuration (Windows)

Add the following to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "iobroker": {
      "command": "mcp-proxy",
      "args": ["http://192.168.1.19:8933/sse"],
      "env": {
        "API_ACCESS_TOKEN": "your-api-key"
      }
    }
  }
}
```

Replace `192.168.1.19` with your ioBroker server IP address and `your-api-key` with your configured API key.

## Usage

Once configured, you can interact with your ioBroker system through your AI assistant. Examples:

- "Get the current temperature from sensor hm-rpc.0.ABC123.1.TEMPERATURE"
- "Turn on the living room light"
- "Show me all running adapter instances"
- "What's the system status?"

## Security

- Always use authentication when exposing the MCP server to the network
- Use strong API keys
- Consider using filters to limit access to specific states and objects
- The proxy should only be accessible from trusted networks

## Troubleshooting

### Connection Issues
1. Check if the adapter is running in ioBroker
2. Verify the IP address and port configuration
3. Ensure no firewall is blocking the connection
4. Check the adapter logs for errors

### Proxy Issues
1. Ensure mcp-proxy is installed correctly
2. Verify the proxy can reach the ioBroker server
3. Check if the API key matches the configuration

## Changelog

### 0.1.0 (2024-06-05)
* (Your Name) Initial release

## License
MIT License

Copyright (c) 2024 Your Name <your.email@example.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 