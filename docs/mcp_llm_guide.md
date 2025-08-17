# ioBroker MCP Tools - LLM Guide

This guide helps LLMs understand and effectively use the ioBroker MCP tools for home automation tasks.

## Available Tools

### 1. State Management

#### `getState(id)`
- **Purpose**: Read current value of a state/datapoint
- **Parameters**: 
  - `id` (string): State ID (e.g., "tuya.0.bf7200ddef31e2095bgr46.106")
- **Returns**: Current state value with metadata
- **Example**: Get current temperature sensor value

#### `setState(id, value, ack?)`
- **Purpose**: Set value of a state/datapoint
- **Parameters**:
  - `id` (string): State ID
  - `value` (any): New value to set
  - `ack` (boolean, optional): Acknowledgment flag (default: false)
- **Returns**: Confirmation of state change
- **Example**: Turn on a light switch

#### `getStates(pattern?)`
- **Purpose**: Get multiple states matching a pattern
- **Parameters**:
  - `pattern` (string, optional): Pattern to filter states (e.g., "tuya.0.*")
- **Returns**: Array of matching states
- **Example**: Get all Tuya device states

### 2. Object Management

#### `getObject(id)`
- **Purpose**: Get object metadata for a state/device
- **Parameters**:
  - `id` (string): Object ID
- **Returns**: Object metadata (type, common properties, native properties)
- **Example**: Get device information

#### `getObjects(pattern?, type?)`
- **Purpose**: Get multiple objects with optional filtering
- **Parameters**:
  - `pattern` (string, optional): Pattern to filter objects
  - `type` (string, optional): Object type filter ("state", "channel", "device")
- **Returns**: Array of matching objects
- **Example**: Get all device objects

### 3. History Data (Most Complex Tool)

#### `getHistory(id, options?, format?)`
- **Purpose**: Retrieve historical data for any state with comprehensive query options
- **Parameters**:
  - `id` (string): State ID to query history for
  - `options` (object, optional): Query configuration
  - `format` (string, optional): Output format

#### Time Options (`options.start`, `options.end`)
Supported time formats:
- **Minutes**: `"5m"`, `"10m"`, `"15m"`, `"30m"`, `"45m"`, `"90m"` (any number)
- **Hours**: `"1h"`, `"2h"`, `"4h"`, `"6h"`, `"12h"`, `"18h"`, `"24h"` (any number)
- **Days**: `"1d"`, `"3d"`, `"7d"`, `"14d"`, `"30d"` (any number)
- **Weeks**: `"1w"`, `"2w"`, `"4w"` (any number)
- **ISO Strings**: `"2025-08-16T10:00:00.000Z"`
- **Milliseconds**: Direct timestamp values
- **Special**: `"now"` for current time

**Examples**: `"12m"`, `"4h"`, `"2d"`, `"1w"`, `"2025-08-16T10:00:00.000Z"`

#### Aggregation Options (`options.aggregate`)
- `"onchange"` (default): Return values when they change
- `"none"`: Return all raw values
- `"min"`: Minimum value per interval
- `"max"`: Maximum value per interval
- `"avg"`: Average value per interval
- `"sum"`: Sum of values per interval
- `"count"`: Count of values per interval

#### Output Formats (`format`)
- `"raw"` (default): Full ioBroker response with all metadata
- `"simple"`: Clean [timestamp, value] pairs
- `"csv"`: CSV-like format for data processing
- `"summary"`: Statistical overview with trends
- `"hourly"`: Hourly aggregated data
- `"daily"`: Daily aggregated data

#### Common Use Cases

**Recent Data (Last Hour)**
```javascript
{
  id: "sensor.id",
  options: { start: "1h", end: "now", aggregate: "onchange" },
  format: "simple"
}
```

**Statistical Overview**
```javascript
{
  id: "sensor.id", 
  options: { start: "24h", end: "now", aggregate: "avg", step: "1h" },
  format: "summary"
}
```

**Limited Recent Entries**
```javascript
{
  id: "sensor.id",
  options: { start: "7d", end: "now", aggregate: "none", count: 10, returnNewestEntries: true },
  format: "simple"
}
```

### 4. Script Management

#### `startScript(scriptId)`
- **Purpose**: Start a JavaScript script
- **Parameters**:
  - `scriptId` (string): Script ID (e.g., "javascript.0.MyScript")
- **Returns**: Confirmation of script start

#### `stopScript(scriptId)`
- **Purpose**: Stop a running script
- **Parameters**:
  - `scriptId` (string): Script ID
- **Returns**: Confirmation of script stop

### 5. Log Management

#### `readLogs(host?)`
- **Purpose**: Read system logs
- **Parameters**:
  - `host` (string, optional): Host name (default: current host)
- **Returns**: Log file information

#### `logMessage(text, level?)`
- **Purpose**: Add entry to ioBroker log
- **Parameters**:
  - `text` (string): Log message
  - `level` (string, optional): Log level ("info", "warn", "error", "debug")
- **Returns**: Confirmation of log entry

### 6. File Operations

#### `readFile(adapter, fileName, binary?)`
- **Purpose**: Read file from ioBroker adapter
- **Parameters**:
  - `adapter` (string): Adapter instance (e.g., "vis.0")
  - `fileName` (string): File path (e.g., "main/vis-views.json")
  - `binary` (boolean, optional): Return as binary (default: false)
- **Returns**: File contents

#### `writeFile(adapter, fileName, data, binary?)`
- **Purpose**: Write file to ioBroker adapter
- **Parameters**:
  - `adapter` (string): Adapter instance
  - `fileName` (string): File path
  - `data` (string): File content
  - `binary` (boolean, optional): Content is binary (default: false)
- **Returns**: Confirmation of file write

### 7. Communication

#### `sendTo(instance, command, message?)`
- **Purpose**: Send message to adapter instance
- **Parameters**:
  - `instance` (string): Adapter instance (e.g., "telegram.0")
  - `command` (string): Command to send
  - `message` (any, optional): Message payload
- **Returns**: Response from adapter
- **Example**: Send Telegram message

### 8. Chart Visualization

#### `createChartViewer(title?, sensors, start?, end?, width?, height?)`
- **Purpose**: Create interactive HTML chart for multiple sensors
- **Parameters**:
  - `title` (string, optional): Chart title
  - `sensors` (array): Array of sensor objects with id, label, color
  - `start` (string, optional): Start time (default: "2h")
  - `end` (string, optional): End time (default: "now")
  - `width` (number, optional): Chart width (default: 1200)
  - `height` (number, optional): Chart height (default: 600)
- **Returns**: HTML chart viewer

## Best Practices for LLMs

### 1. Error Handling
- Always check if a state exists before trying to read/write it
- Use `getObject()` to verify state properties before operations
- Handle timeouts gracefully for history queries

### 2. Performance Considerations
- Use appropriate time ranges for history queries
- Limit result counts for large datasets
- Use aggregation to reduce data volume

### 3. Data Format Selection
- Use `"simple"` format for basic data analysis
- Use `"summary"` format for quick overviews
- Use `"raw"` format when you need full metadata

### 4. Common Patterns

**Check if device is online:**
```javascript
getState("device.id.alive")
```

**Get sensor statistics:**
```javascript
getHistory("sensor.id", { start: "24h", aggregate: "avg", step: "1h" }, "summary")
```

**Monitor recent changes:**
```javascript
getHistory("sensor.id", { start: "1h", aggregate: "onchange", count: 20 }, "simple")
```

**Send notification:**
```javascript
sendTo("telegram.0", "send", { text: "Alert: Temperature is high!" })
```

## Troubleshooting

### Common Issues

1. **"Not found: datapoint"**
   - Check if the state ID is correct
   - Use `getObjects()` to find available states

2. **"Invalid time value"**
   - Use supported time formats (see Time Options above)
   - Check for typos in time strings

3. **"Connection refused"**
   - Verify ioBroker is running
   - Check REST API is enabled
   - Verify network connectivity

4. **Empty history results**
   - Check if history is enabled for the state
   - Verify the time range contains data
   - Try different aggregation methods

### Debugging Tips

1. Start with `getObject()` to understand the state structure
2. Use `"raw"` format first to see full response
3. Test with simple queries before complex ones
4. Check logs with `readLogs()` for system issues

## Example Workflows

### Temperature Monitoring
```javascript
// Get current temperature
const temp = getState("sensor.temperature")

// Get 24h statistics
const stats = getHistory("sensor.temperature", { start: "24h" }, "summary")

// Alert if too high
if (temp.val > 25) {
  sendTo("telegram.0", "send", { text: `Temperature alert: ${temp.val}°C` })
}
```

### Device Status Check
```javascript
// Get all Tuya devices
const devices = getObjects("tuya.0.*", "device")

// Check each device status
devices.forEach(device => {
  const alive = getState(`${device._id}.alive`)
  if (!alive.val) {
    logMessage(`Device ${device.common.name} is offline`, "warn")
  }
})
```

This guide should help LLMs effectively use the ioBroker MCP tools for home automation tasks.
