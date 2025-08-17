import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const IOBROKER_HOST = process.env.IOBROKER_HOST || '192.168.1.19';
const IOBROKER_PORT = process.env.IOBROKER_PORT || '8087';
const IOBROKER_PROTOCOL = process.env.IOBROKER_PROTOCOL || 'http';
const IOBROKER_USER = process.env.IOBROKER_USER;
const IOBROKER_PASSWORD = process.env.IOBROKER_PASSWORD;

// Create axios instance with auth if provided
const api: AxiosInstance = axios.create({
  baseURL: `${IOBROKER_PROTOCOL}://${IOBROKER_HOST}:${IOBROKER_PORT}`,
  timeout: 30000, // Increased timeout for history queries
  ...(IOBROKER_USER && IOBROKER_PASSWORD && {
    auth: {
      username: IOBROKER_USER,
      password: IOBROKER_PASSWORD,
    },
  }),
});

// Helper function to use REST API command interface
async function callRestAPICommand(command: string, params: any = {}) {
  const response = await api.get(`/v1/command/${command}`, {
    params: params,
  });
  return response.data;
}

// Helper function for POST requests to REST API command interface
async function callRestAPICommandPost(command: string, params: any = {}) {
  const response = await api.post(`/v1/command/${command}`, params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

// Helper function for direct state access
async function getStateDirect(id: string) {
  const response = await api.get(`/v1/state/${encodeURIComponent(id)}`);
  return response.data;
}

// Helper function for direct state setting
async function setStateDirect(id: string, value: any, ack: boolean = false) {
  const response = await api.get(`/v1/state/${encodeURIComponent(id)}`, {
    params: {
      value: JSON.stringify({ val: value, ack: ack })
    }
  });
  return response.data;
}

// Helper function to parse relative time strings into milliseconds
function parseRelativeTime(timeString: string): number {
  // Handle special cases
  if (timeString === 'now') {
    return Date.now();
  }
  
  // Parse ISO date strings
  if (timeString.includes('T') || timeString.includes('-')) {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
  }
  
  // Parse relative time strings like "5m", "2h", "3d", "1w", etc.
  const match = timeString.match(/^(\d+)([mhdw])$/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'm': // minutes
        return Date.now() - value * 60 * 1000;
      case 'h': // hours
        return Date.now() - value * 60 * 60 * 1000;
      case 'd': // days
        return Date.now() - value * 24 * 60 * 60 * 1000;
      case 'w': // weeks
        return Date.now() - value * 7 * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid time unit: ${unit}`);
    }
  }
  
  // If it's a number, assume it's already milliseconds
  const numValue = parseInt(timeString);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  throw new Error(`Invalid time value: ${timeString}. Supported formats: "5m", "2h", "3d", "1w", ISO date, or milliseconds`);
}

// Zeitzonen-Hilfsfunktionen
function getLocalTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || 'UTC';
  } catch (error) {
    console.warn('Could not detect timezone, using UTC');
    return 'UTC';
  }
}

function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset() * 60 * 1000; // Offset in Millisekunden
}

function localToUTC(localTime: number): number {
  return localTime + getTimezoneOffset();
}

function utcToLocal(utcTime: number): number {
  return utcTime - getTimezoneOffset();
}

function formatLocalTime(utcTime: number): string {
  const date = new Date(utcTime);
  return date.toLocaleString('de-DE', {
    timeZone: getLocalTimezone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Erweiterte parseRelativeTime mit Zeitzonen-Unterstützung
function parseRelativeTimeWithTimezone(timeString: string): number {
  const baseTime = parseRelativeTime(timeString);
  
  // parseRelativeTime gibt bereits UTC zurück, also keine weitere Konvertierung nötig
  return baseTime;
}

// Tool schemas
const GetStateSchema = z.object({
  id: z.string().describe('State ID (e.g., "hm-rpc.0.ABC123.1.STATE")'),
});

const SetStateSchema = z.object({
  id: z.string().describe('State ID'),
  value: z.any().describe('Value to set'),
  ack: z.boolean().optional().default(false).describe('Acknowledged flag'),
});

const GetStatesSchema = z.object({
  pattern: z.string().optional().describe('Pattern to filter states (e.g., "hm-rpc.0.*")'),
});

const GetObjectSchema = z.object({
  id: z.string().describe('Object ID'),
});

const GetObjectsSchema = z.object({
  pattern: z.string().optional().describe('Pattern to filter objects'),
  type: z.string().optional().describe('Object type (e.g., "state", "channel", "device")'),
});

const SendToSchema = z.object({
  instance: z.string().describe('Adapter instance (e.g., "telegram.0")'),
  command: z.string().describe('Command to send'),
  message: z.any().optional().describe('Message payload'),
});

// Script Management
const StartScriptSchema = z.object({
  scriptId: z.string().describe('Script ID (e.g., "javascript.0.Lüfter_Bad_Anbau")'),
});

const StopScriptSchema = z.object({
  scriptId: z.string().describe('Script ID (e.g., "javascript.0.Lüfter_Bad_Anbau")'),
});

// Log Management
const ReadLogsSchema = z.object({
  host: z.string().optional().describe('Host name (optional, defaults to current host)'),
});

const LogMessageSchema = z.object({
  text: z.string().describe('Log message text'),
  level: z.enum(['info', 'warn', 'error', 'debug']).optional().default('info').describe('Log level'),
});

// File Operations
const ReadFileSchema = z.object({
  adapter: z.string().describe('Adapter instance (e.g., "vis.0")'),
  fileName: z.string().describe('File name (e.g., "main/vis-views.json")'),
  binary: z.boolean().optional().default(false).describe('Return as binary file'),
});

const WriteFileSchema = z.object({
  adapter: z.string().describe('Adapter instance (e.g., "vis.0")'),
  fileName: z.string().describe('File name (e.g., "main/test.json")'),
  data: z.string().describe('File content (JSON string or base64 for binary)'),
  binary: z.boolean().optional().default(false).describe('Content is binary (base64)'),
});

// History Management
const GetHistorySchema = z.object({
  id: z.string().describe('State ID (e.g., "system.adapter.admin.0.memRss")'),
  options: z.object({
    start: z.string().optional().describe('Start time. Supports: "5m", "2h", "3d", "1w", ISO date, or milliseconds'),
    end: z.string().optional().describe('End time. Supports: "now", "5m", "2h", "3d", "1w", ISO date, or milliseconds'),
    count: z.number().optional().describe('Number of values to return'),
    aggregate: z.enum(['min', 'max', 'avg', 'sum', 'count', 'onchange', 'none']).optional().default('onchange').describe('Aggregation method'),
    step: z.string().optional().describe('Step interval (e.g., "1h", "30m")'),
    addId: z.boolean().optional().default(false).describe('Include state ID in result'),
    limit: z.number().optional().describe('Limit number of results'),
    round: z.number().optional().describe('Round values to N decimal places'),
    ignoreNull: z.boolean().optional().default(true).describe('Ignore null values'),
    returnNewestEntries: z.boolean().optional().default(false).describe('Return newest entries first'),
  }).optional().describe('History query options'),

});



// Create MCP server
const server = new Server(
  {
    name: 'iobroker-mcp-server',
    vendor: 'standalone',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to check connection
async function checkConnection(): Promise<boolean> {
  try {
    // Use simple API endpoint to check connection
    await api.get('/');
    return true;
  } catch (error) {
    console.error('Failed to connect to ioBroker:', error);
    return false;
  }
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'getState',
      description: 'Get a state value from ioBroker',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'State ID (e.g., "hm-rpc.0.ABC123.1.STATE")'
          }
        },
        required: ['id']
      },
    },
    {
      name: 'setState',
      description: 'Set a state value in ioBroker',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'State ID'
          },
          value: {
            description: 'Value to set'
          },
          ack: {
            type: 'boolean',
            description: 'Acknowledged flag',
            default: false
          }
        },
        required: ['id', 'value']
      },
    },
    {
      name: 'getStates',
      description: 'Get multiple states from ioBroker with optional pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Pattern to filter states (e.g., "hm-rpc.0.*")'
          }
        }
      },
    },
    {
      name: 'getObject',
      description: 'Get an object from ioBroker',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Object ID'
          }
        },
        required: ['id']
      },
    },
    {
      name: 'getObjects',
      description: 'Get multiple objects from ioBroker with optional pattern and type filter',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Pattern to filter objects'
          },
          type: {
            type: 'string',
            description: 'Object type (e.g., "state", "channel", "device")'
          }
        }
      },
    },
    {
      name: 'sendTo',
      description: 'Send a message to an adapter instance',
      inputSchema: {
        type: 'object',
        properties: {
          instance: {
            type: 'string',
            description: 'Adapter instance (e.g., "telegram.0")'
          },
          command: {
            type: 'string',
            description: 'Command to send'
          },
          message: {
            description: 'Message payload'
          }
        },
        required: ['instance', 'command']
      },
    },
    {
      name: 'startScript',
      description: 'Start a JavaScript script in ioBroker',
      inputSchema: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'Script ID (e.g., "javascript.0.Lüfter_Bad_Anbau")'
          }
        },
        required: ['scriptId']
      },
    },
    {
      name: 'stopScript',
      description: 'Stop a JavaScript script in ioBroker',
      inputSchema: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'Script ID (e.g., "javascript.0.Lüfter_Bad_Anbau")'
          }
        },
        required: ['scriptId']
      },
    },
    {
      name: 'readLogs',
      description: 'Read log file information from ioBroker',
      inputSchema: {
        type: 'object',
        properties: {
          host: {
            type: 'string',
            description: 'Host name (optional, defaults to current host)'
          }
        }
      },
    },
    {
      name: 'logMessage',
      description: 'Add a log entry to ioBroker',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Log message text'
          },
          level: {
            type: 'string',
            enum: ['info', 'warn', 'error', 'debug'],
            description: 'Log level',
            default: 'info'
          }
        },
        required: ['text']
      },
    },
    {
      name: 'readFile',
      description: 'Read a file from ioBroker adapter',
      inputSchema: {
        type: 'object',
        properties: {
          adapter: {
            type: 'string',
            description: 'Adapter instance (e.g., "vis.0")'
          },
          fileName: {
            type: 'string',
            description: 'File name (e.g., "main/vis-views.json")'
          },
          binary: {
            type: 'boolean',
            description: 'Return as binary file',
            default: false
          }
        },
        required: ['adapter', 'fileName']
      },
    },
    {
      name: 'writeFile',
      description: 'Write a file to ioBroker adapter',
      inputSchema: {
        type: 'object',
        properties: {
          adapter: {
            type: 'string',
            description: 'Adapter instance (e.g., "vis.0")'
          },
          fileName: {
            type: 'string',
            description: 'File name (e.g., "main/test.json")'
          },
          data: {
            type: 'string',
            description: 'File content (JSON string or base64 for binary)'
          },
          binary: {
            type: 'boolean',
            description: 'Content is binary (base64)',
            default: false
          }
        },
        required: ['adapter', 'fileName', 'data']
      },
    },
    {
      name: 'getHistory',
      description: 'Get historical data from ioBroker history adapter. All times are automatically converted to your local timezone. Convert user requests like "last 35 minutes" or "from 10:00 to 12:00 today" into proper time parameters. Perfect for analyzing sensor trends, monitoring device performance, and creating time-series visualizations.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'State ID to query history for. Must be a valid ioBroker state that has history enabled. Examples: temperature sensors, power meters, device status, system metrics.',
            examples: ['"tuya.0.bf7200ddef31e2095bgr46.106"', '"system.adapter.admin.0.memRss"', '"hm-rpc.0.ABC123.1.TEMPERATURE"']
          },
          options: {
            type: 'object',
            description: 'History query options - all fields are optional with sensible defaults. Configure time range, aggregation, and data processing.',
            properties: {
              start: {
                type: 'string',
                description: 'Start time in your local timezone. Convert natural language to: relative formats ("35m", "2h", "3d", "1w"), local time ("2025-08-16T10:00:00"), or "now". Examples: "last 35 minutes" → "35m", "yesterday 10:00" → "2025-08-15T10:00:00", "2 hours ago" → "2h". Automatically converted to UTC for API. Default: "1h" (last hour)',
                examples: ['"35m"', '"2h"', '"3d"', '"1w"', '"2025-08-16T10:00:00"', '"now"']
              },
              end: {
                type: 'string',
                description: 'End time in your local timezone. Convert natural language to: "now" for current time, relative formats ("30m", "2h"), or local time ("2025-08-16T14:00:00"). Examples: "until now" → "now", "until 12:00" → "2025-08-16T12:00:00". Automatically converted to UTC for API. Default: "now"',
                examples: ['"now"', '"30m"', '"2h"', '"2025-08-16T14:00:00"']
              },
              count: {
                type: 'number',
                description: 'Number of values to return. For aggregate "onchange": number of data points. For other aggregates: number of time intervals. Higher values = more detailed data but slower response. Default: 500',
                examples: [10, 50, 100, 500, 1000]
              },
              aggregate: {
                type: 'string',
                enum: ['min', 'max', 'avg', 'sum', 'count', 'onchange', 'none'],
                description: 'Aggregation method for data points. "onchange" = values when they change (most common), "none" = all raw values, "min/max/avg" = statistics per interval, "sum" = sum per interval, "count" = number of values per interval. Default: "onchange"',
                default: 'onchange'
              },
              step: {
                type: 'string',
                description: 'Time step for aggregation (only used with aggregate methods other than "onchange" or "none"). Defines the interval size for grouping data. Examples: "30m" (30-minute intervals), "1h" (hourly), "6h" (6-hour intervals), "1d" (daily)',
                examples: ['"30m"', '"1h"', '"6h"', '"1d"', '"1w"']
              },
              addId: {
                type: 'boolean',
                description: 'Include state ID in each result entry. Useful when querying multiple states or for debugging. Default: false',
                default: false
              },
              limit: {
                type: 'number',
                description: 'Maximum number of entries to return (overrides count if both specified). Use for performance optimization with large datasets. Default: no limit',
                examples: [10, 50, 100, 1000]
              },
              round: {
                type: 'number',
                description: 'Round numeric values to specified number of decimal places. Useful for cleaning up sensor data. 0 = integers, 1 = 1 decimal, 2 = 2 decimals, etc.',
                examples: [0, 1, 2, 3]
              },
              ignoreNull: {
                type: 'boolean',
                description: 'How to handle null/missing values: true = replace with last non-null value (recommended), false = include nulls in results, 0 = replace with 0. Default: true',
                default: true
              },
              returnNewestEntries: {
                type: 'boolean',
                description: 'When using count/limit with aggregate "none", return newest entries instead of oldest. Useful for getting recent data. Default: false (oldest first)',
                default: false
              }
            }
          },

        },
        required: ['id']
      },
    },

  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'getState': {
        const { id } = GetStateSchema.parse(args);
        
        try {
          // Try direct state access first
          const response = await getStateDirect(id);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(response, null, 2),
            }],
          };
        } catch (error) {
          // Fallback to command interface
          const response = await callRestAPICommand('getState', { id });
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(response, null, 2),
            }],
          };
        }
      }

      case 'setState': {
        const { id, value, ack } = SetStateSchema.parse(args);
        
        try {
          // Try direct state setting first
          const response = await setStateDirect(id, value, ack || false);
          return {
            content: [{
              type: 'text',
              text: `State ${id} set to ${JSON.stringify(value)} (ack: ${ack}). Response: ${JSON.stringify(response)}`,
            }],
          };
        } catch (error) {
          // Fallback to command interface
          const response = await callRestAPICommandPost('setState', { 
            id, 
            state: { val: value, ack: ack || false }
          });
          return {
            content: [{
              type: 'text',
              text: `State ${id} set to ${JSON.stringify(value)} (ack: ${ack}). Response: ${JSON.stringify(response)}`,
            }],
          };
        }
      }

      case 'getStates': {
        const { pattern } = GetStatesSchema.parse(args);
        
        const response = await callRestAPICommand('getStates', { 
          pattern: pattern || '*' 
        });
        
        const states = response || {};
        const count = Object.keys(states).length;
        
        return {
          content: [{
            type: 'text',
            text: `Found ${count} states${pattern ? ` matching pattern "${pattern}"` : ''}:\n${JSON.stringify(states, null, 2)}`,
          }],
        };
      }

      case 'getObject': {
        const { id } = GetObjectSchema.parse(args);
        
        const response = await callRestAPICommand('getObject', { id });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2),
          }],
        };
      }

      case 'getObjects': {
        const { pattern, type } = GetObjectsSchema.parse(args);
        
        // Laut Dokumentation: getObjects(list) - get all states and rooms
        // Wir verwenden pattern als list Parameter
        const response = await callRestAPICommand('getObjects', { 
          list: pattern || '*'
        });
        
        const objects = response || {};
        const count = Object.keys(objects).length;
        
        return {
          content: [{
            type: 'text',
            text: `Found ${count} objects${pattern ? ` matching pattern "${pattern}"` : ''}${type ? ` of type "${type}"` : ''}:\n${JSON.stringify(objects, null, 2)}`,
          }],
        };
      }

      case 'sendTo': {
        const { instance, command, message } = SendToSchema.parse(args);
        
        try {
          // Versuche zuerst die normale sendTo Methode
          const response = await callRestAPICommandPost('sendTo', {
            adapterInstance: instance,
            command: command,
            message: message
          });
          
          return {
            content: [{
              type: 'text',
              text: `Message sent to ${instance} with command "${command}". Response: ${JSON.stringify(response)}`,
            }],
          };
        } catch (error) {
          // Fallback: Prüfe ob es ein Adapter-Restart ist
          if (command === 'restart' || command === 'start' || command === 'stop') {
            const objectId = `system.adapter.${instance}`;
            
            // Deaktivieren für Restart
            if (command === 'restart') {
              // Optimierte Methode: Reduzierte Pause
              await callRestAPICommandPost('extendObject', {
                id: objectId,
                obj: { common: { enabled: false } }
              });
              
              // Reduzierte Pause (von 500ms auf 300ms)
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Wieder aktivieren
              await callRestAPICommandPost('extendObject', {
                id: objectId,
                obj: { common: { enabled: true } }
              });
              
              return {
                content: [{
                  type: 'text',
                  text: `✅ Adapter ${instance} erfolgreich neu gestartet`,
                }],
              };
            }
            
            // Start/Stop
            const enabled = command === 'start';
            await callRestAPICommandPost('extendObject', {
              id: objectId,
              obj: { common: { enabled: enabled } }
            });
            
            return {
              content: [{
                type: 'text',
                text: `✅ Adapter ${instance} ${command === 'start' ? 'gestartet' : 'gestoppt'}`,
              }],
            };
          }
          
          // Wenn es kein Adapter-Command ist, werfe den ursprünglichen Fehler
          throw error;
        }
      }

      case 'startScript': {
        const { scriptId } = StartScriptSchema.parse(args);
        
        try {
          // Versuche zuerst die normale sendTo Methode
          const response = await callRestAPICommandPost('sendTo', {
            adapterInstance: 'javascript.0',
            command: 'startScript',
            message: { scriptId }
          });
          
          return {
            content: [{
              type: 'text',
              text: `Script ${scriptId} start command sent. Response: ${JSON.stringify(response)}`,
            }],
          };
        } catch (error) {
          // Fallback: Prüfe ob javascript.0 Adapter läuft
          try {
            const jsAdapterStatus = await callRestAPICommand('getState', { 
              id: 'system.adapter.javascript.0.alive' 
            });
            
            if (!jsAdapterStatus?.val) {
              return {
                content: [{
                  type: 'text',
                  text: `Error: javascript.0 adapter is not running. Cannot start script ${scriptId}. Please start the javascript adapter first.`,
                }],
              };
            }
            
            return {
              content: [{
                type: 'text',
                text: `Error starting script ${scriptId}: ${error}. JavaScript adapter is running but script command failed.`,
              }],
            };
          } catch (statusError) {
            return {
              content: [{
                type: 'text',
                text: `Error starting script ${scriptId}: ${error}. Could not check javascript adapter status.`,
              }],
            };
          }
        }
      }

      case 'stopScript': {
        const { scriptId } = StopScriptSchema.parse(args);
        
        const response = await callRestAPICommandPost('sendTo', {
          adapterInstance: 'javascript.0',
          command: 'stopScript',
          message: { scriptId }
        });
        
        return {
          content: [{
            type: 'text',
            text: `Script ${scriptId} stop command sent. Response: ${JSON.stringify(response)}`,
          }],
        };
      }

      case 'readLogs': {
        const { host } = ReadLogsSchema.parse(args);
        
        const response = await callRestAPICommand('readLogs', {
          host: host || 'localhost'
        });
        
        return {
          content: [{
            type: 'text',
            text: `Log files for host ${host || 'localhost'}:\n${JSON.stringify(response, null, 2)}`,
          }],
        };
      }

      case 'logMessage': {
        const { text, level } = LogMessageSchema.parse(args);
        
        const response = await callRestAPICommand('log', {
          text: text,
          level: level || 'info'
        });
        
        return {
          content: [{
            type: 'text',
            text: `Log entry added with level "${level || 'info'}": ${text}. Response: ${JSON.stringify(response)}`,
          }],
        };
      }

      case 'readFile': {
        const { adapter, fileName, binary } = ReadFileSchema.parse(args);
        
        const response = await callRestAPICommand('readFile', {
          adapter: adapter,
          fileName: fileName,
          binary: binary || false
        });
        
        return {
          content: [{
            type: 'text',
            text: `File content from ${adapter}/${fileName}:\n${JSON.stringify(response, null, 2)}`,
          }],
        };
      }

      case 'writeFile': {
        const { adapter, fileName, data, binary } = WriteFileSchema.parse(args);
        
        try {
          const response = await callRestAPICommandPost('writeFile64', {
            adapter: adapter,
            fileName: fileName,
            data64: Buffer.from(data).toString('base64'),
            options: { binary: binary || false }
          });
          
          return {
            content: [{
              type: 'text',
              text: `File written to ${adapter}/${fileName}. Response: ${JSON.stringify(response)}`,
            }],
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error writing file to ${adapter}/${fileName}: ${error}`,
            }],
          };
        }
      }

      case 'getHistory': {
        const { id, options } = GetHistorySchema.parse(args);
        
        // Intelligente Zeit-Berechnung mit Zeitzonen-Unterstützung
        const now = Date.now();
        const end = options?.end ? parseRelativeTimeWithTimezone(options.end) : now;
        const start = options?.start ? parseRelativeTimeWithTimezone(options.start) : end - (2 * 60 * 60 * 1000);
        
        try {
          // Make the API call using the configured axios instance
          const response = await api.get(`/v1/getHistory/${encodeURIComponent(id)}?start=${start}&end=${end}`);
          const historyData = response.data || [];
          
          // Simple format result mit lokaler Zeitanzeige
          const formattedResult = {
            id,
            timezone: getLocalTimezone(),
            period: `${formatLocalTime(start)} to ${formatLocalTime(end)}`,
            data: historyData.map((entry: any) => [
              formatLocalTime(entry.ts), // Lokale Zeit für Anzeige
              entry.val
            ]),
            summary: {
              count: historyData.length,
              min: historyData.length > 0 ? Math.min(...historyData.map((d: any) => d.val)) : 0,
              max: historyData.length > 0 ? Math.max(...historyData.map((d: any) => d.val)) : 0,
              avg: historyData.length > 0 ? Math.round(historyData.reduce((sum: number, d: any) => sum + d.val, 0) / historyData.length * 100) / 100 : 0
            }
          };
          
          return {
            content: [{
              type: 'text',
              text: `Found ${historyData.length} history entries for ${id}:\n${JSON.stringify(formattedResult, null, 2)}`,
            }],
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error getting history for ${id}: ${error}`,
            }],
          };
        }
      }



      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.response?.data || error.message;
      
      if (status === 404) {
        return {
          content: [{
            type: 'text',
            text: `Not found: ${message}`,
          }],
        };
      } else if (status === 401) {
        return {
          content: [{
            type: 'text',
            text: 'Authentication failed. Please check your credentials in .env file.',
          }],
        };
      } else if (status === 403) {
        return {
          content: [{
            type: 'text',
            text: 'Access denied. Please check your permissions.',
          }],
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: `Error: ${message} (Status: ${status || 'unknown'})`,
        }],
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
    };
  }
});













// Start server
async function main() {
  console.error(`Connecting to ioBroker at ${IOBROKER_PROTOCOL}://${IOBROKER_HOST}:${IOBROKER_PORT}...`);
  
  const connected = await checkConnection();
  if (!connected) {
    console.error('Failed to connect to ioBroker. Please check:');
    console.error('1. ioBroker is running');
    console.error('2. REST API is enabled');
    console.error('3. Host and port are correct in .env file');
    console.error('4. Firewall allows connection');
    process.exit(1);
  }
  
  console.error('Successfully connected to ioBroker!');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch(console.error); 