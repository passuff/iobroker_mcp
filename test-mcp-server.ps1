Write-Host "Starting ioBroker MCP Server Test..." -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "- ioBroker Host: 192.168.1.19"
Write-Host "- ioBroker Port: 8081"
Write-Host "- Namespace: mcp-server.0"
Write-Host ""

$env:IOBROKER_HOST = "192.168.1.19"
$env:IOBROKER_PORT = "8081"
$env:IOBROKER_NAMESPACE = "mcp-server.0"

# Optional: Enable authentication
# $env:MCP_ENABLE_AUTH = "true"
# $env:MCP_API_KEY = "your-secure-api-key"

Write-Host "Starting MCP Server..." -ForegroundColor Green
node build/lib/mcp-server.js 