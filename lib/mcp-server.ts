import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import tool handlers
import { registerStateTools } from "./tools/states.js";
import { registerObjectTools } from "./tools/objects.js";
import { registerAdapterTools } from "./tools/adapters.js";
import { registerSystemTools } from "./tools/system.js";

// Get configuration from environment
const namespace = process.env.IOBROKER_NAMESPACE || 'mcp-server.0';
const iobrokerHost = process.env.IOBROKER_HOST || 'localhost';
const iobrokerPort = process.env.IOBROKER_PORT || '8081';
const apiKey = process.env.MCP_API_KEY || '';
const enableAuth = process.env.MCP_ENABLE_AUTH === 'true';

// Create MCP server instance
const server = new McpServer({
    name: "ioBroker MCP Server",
    version: "0.1.0",
    capabilities: {
        resources: {},
        tools: {},
        prompts: {}
    }
});

// Create connection wrapper that uses HTTP/Socket.IO API
function createIoBrokerConnection() {
    const baseUrl = `http://${iobrokerHost}:${iobrokerPort}`;
    
    // Helper function to make API requests
    async function apiRequest(method: string, path: string, data?: any) {
        const url = `${baseUrl}/api/v1/${path}`;
        const options: any = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    return {
        namespace,
        
        // State operations using REST API
        getForeignState: async (id: string) => {
            try {
                const response = await apiRequest('GET', `state/${id}`);
                return response;
            } catch (error) {
                console.error(`Error getting state ${id}:`, error);
                return null;
            }
        },
        
        setForeignState: async (id: string, value: any, ack: boolean = false) => {
            try {
                await apiRequest('POST', `state/${id}`, { val: value, ack });
                return true;
            } catch (error) {
                console.error(`Error setting state ${id}:`, error);
                return false;
            }
        },
        
        getForeignStates: async (pattern: string) => {
            try {
                const response = await apiRequest('GET', `states?pattern=${encodeURIComponent(pattern)}`);
                return response;
            } catch (error) {
                console.error(`Error getting states with pattern ${pattern}:`, error);
                return {};
            }
        },
        
        getStatesPattern: async (pattern: string) => {
            return this.getForeignStates(pattern);
        },
        
        // Object operations using REST API
        getForeignObject: async (id: string) => {
            try {
                const response = await apiRequest('GET', `object/${id}`);
                return response;
            } catch (error) {
                console.error(`Error getting object ${id}:`, error);
                return null;
            }
        },
        
        setForeignObject: async (id: string, obj: any) => {
            try {
                await apiRequest('PUT', `object/${id}`, obj);
                return true;
            } catch (error) {
                console.error(`Error setting object ${id}:`, error);
                return false;
            }
        },
        
        getForeignObjects: async (pattern: string, type?: string) => {
            try {
                let url = `objects?pattern=${encodeURIComponent(pattern)}`;
                if (type) {
                    url += `&type=${type}`;
                }
                const response = await apiRequest('GET', url);
                return Array.isArray(response) ? response : Object.values(response);
            } catch (error) {
                console.error(`Error getting objects with pattern ${pattern}:`, error);
                return [];
            }
        },
        
        getObjectList: async (pattern: string) => {
            return this.getForeignObjects(pattern);
        },
        
        // Logging
        log: {
            info: (msg: string) => console.log(`[INFO] ${msg}`),
            warn: (msg: string) => console.warn(`[WARN] ${msg}`),
            error: (msg: string) => console.error(`[ERROR] ${msg}`),
            debug: (msg: string) => console.debug(`[DEBUG] ${msg}`)
        }
    };
}

// Authentication middleware
function checkAuth(request: any): boolean {
    if (!enableAuth) return true;
    
    const authHeader = request.headers?.authorization;
    if (!authHeader) return false;
    
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || token !== apiKey) return false;
    
    return true;
}

// Register all tools
async function registerTools(connection: any) {
    console.log('Registering MCP tools...');
    
    // Register state management tools
    registerStateTools(server, connection);
    console.log('State management tools registered');
    
    // Register object management tools
    registerObjectTools(server, connection);
    console.log('Object management tools registered');
    
    // Register adapter control tools
    registerAdapterTools(server, connection);
    console.log('Adapter control tools registered');
    
    // Register system information tools
    registerSystemTools(server, connection);
    console.log('System information tools registered');
    
    console.log('All tools registered successfully');
}

// Main function
async function main() {
    try {
        console.log('Starting ioBroker MCP Server...');
        console.log(`Connecting to ioBroker at ${iobrokerHost}:${iobrokerPort}`);
        
        // Create connection wrapper
        const connection = createIoBrokerConnection();
        
        // Test connection
        try {
            await connection.getForeignObject('system.config');
            console.log('Successfully connected to ioBroker');
        } catch (error) {
            console.error('Failed to connect to ioBroker:', error);
            console.error('Make sure ioBroker is running and the REST API is enabled');
            process.exit(1);
        }
        
        // Register all tools
        await registerTools(connection);
        
        // Create and start transport
        const transport = new StdioServerTransport();
        
        // Connect server to transport
        await server.connect(transport);
        
        console.log(`ioBroker MCP Server is running on stdio transport`);
        console.log(`Namespace: ${namespace}`);
        console.log(`Authentication: ${enableAuth ? 'enabled' : 'disabled'}`);
        
    } catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down MCP server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down MCP server...');
    process.exit(0);
});

// Start the server
main().catch(console.error); 