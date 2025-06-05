@echo off
echo Starting ioBroker MCP Server Test...
echo.
echo Configuration:
echo - ioBroker Host: 192.168.1.19
echo - ioBroker Port: 8081
echo - Namespace: mcp-server.0
echo.

set IOBROKER_HOST=192.168.1.19
set IOBROKER_PORT=8081
set IOBROKER_NAMESPACE=mcp-server.0

node build/lib/mcp-server.js

pause 