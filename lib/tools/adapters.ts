import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerAdapterTools(server: McpServer, connection: any) {
    // Tool: Get Adapter Instances
    server.tool(
        "iobroker_getAdapterInstances",
        "List all adapter instances",
        {
            adapter: z.string().optional().describe("Adapter name filter (e.g., 'hm-rpc')")
        },
        async ({ adapter }) => {
            try {
                const pattern = adapter ? `system.adapter.${adapter}.*` : 'system.adapter.*';
                const instances = await connection.getObjectList(pattern);
                
                const adapterInstances = instances
                    .filter((obj: any) => obj.type === 'instance')
                    .map((obj: any) => ({
                        _id: obj._id,
                        enabled: obj.common?.enabled,
                        host: obj.common?.host,
                        mode: obj.common?.mode,
                        name: obj.common?.name,
                        version: obj.common?.version,
                        alive: obj.common?.alive,
                        connected: obj.common?.connected
                    }));
                
                if (adapterInstances.length === 0) {
                    return {
                        content: [{
                            type: "text",
                            text: `No adapter instances found${adapter ? ` for adapter: ${adapter}` : ''}`
                        }]
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(adapterInstances, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting adapter instances: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Control Adapter
    server.tool(
        "iobroker_controlAdapter",
        "Control adapter instance (start/stop/restart)",
        {
            instance: z.string().describe("Instance ID (e.g., 'hm-rpc.0')"),
            action: z.enum(["start", "stop", "restart"]).describe("Action to perform")
        },
        async ({ instance, action }) => {
            try {
                const instanceId = instance.startsWith('system.adapter.') ? instance : `system.adapter.${instance}`;
                
                // Get current instance object
                const instanceObj = await connection.getObject(instanceId);
                if (!instanceObj) {
                    return {
                        content: [{
                            type: "text",
                            text: `Adapter instance ${instance} not found`
                        }],
                        isError: true
                    };
                }
                
                // Perform action
                switch (action) {
                    case 'start':
                        instanceObj.common.enabled = true;
                        break;
                    case 'stop':
                        instanceObj.common.enabled = false;
                        break;
                    case 'restart':
                        // For restart, we need to stop and then start
                        instanceObj.common.enabled = false;
                        await connection.setObject(instanceId, instanceObj);
                        // Wait a bit
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        instanceObj.common.enabled = true;
                        break;
                }
                
                const success = await connection.setObject(instanceId, instanceObj);
                
                if (!success) {
                    return {
                        content: [{
                            type: "text",
                            text: `Failed to ${action} adapter instance ${instance}`
                        }],
                        isError: true
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: `Successfully ${action}ed adapter instance ${instance}`
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error controlling adapter ${instance}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get Adapter Configuration
    server.tool(
        "iobroker_getAdapterConfig",
        "Get adapter instance configuration",
        {
            instance: z.string().describe("Instance ID (e.g., 'hm-rpc.0')")
        },
        async ({ instance }) => {
            try {
                const instanceId = instance.startsWith('system.adapter.') ? instance : `system.adapter.${instance}`;
                const instanceObj = await connection.getObject(instanceId);
                
                if (!instanceObj) {
                    return {
                        content: [{
                            type: "text",
                            text: `Adapter instance ${instance} not found`
                        }],
                        isError: true
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            _id: instanceObj._id,
                            common: instanceObj.common,
                            native: instanceObj.native
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting adapter configuration: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Update Adapter Configuration
    server.tool(
        "iobroker_updateAdapterConfig",
        "Update adapter instance configuration",
        {
            instance: z.string().describe("Instance ID (e.g., 'hm-rpc.0')"),
            native: z.record(z.any()).describe("Native configuration to update")
        },
        async ({ instance, native }) => {
            try {
                const instanceId = instance.startsWith('system.adapter.') ? instance : `system.adapter.${instance}`;
                const instanceObj = await connection.getObject(instanceId);
                
                if (!instanceObj) {
                    return {
                        content: [{
                            type: "text",
                            text: `Adapter instance ${instance} not found`
                        }],
                        isError: true
                    };
                }
                
                // Update native configuration
                instanceObj.native = { ...instanceObj.native, ...native };
                
                const success = await connection.setObject(instanceId, instanceObj);
                
                if (!success) {
                    return {
                        content: [{
                            type: "text",
                            text: `Failed to update adapter configuration for ${instance}`
                        }],
                        isError: true
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: `Successfully updated configuration for adapter instance ${instance}`
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error updating adapter configuration: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get Adapter Logs
    server.tool(
        "iobroker_getAdapterLogs",
        "Get recent log entries for an adapter instance",
        {
            instance: z.string().describe("Instance ID (e.g., 'hm-rpc.0')")
        },
        async ({ instance }) => {
            try {
                // In a real implementation, this would query the log database
                // For now, we'll return a mock response
                const mockLogs = [
                    {
                        timestamp: new Date().toISOString(),
                        level: "info",
                        source: instance,
                        message: `Adapter ${instance} started`
                    },
                    {
                        timestamp: new Date().toISOString(),
                        level: "debug",
                        source: instance,
                        message: `Processing data...`
                    }
                ];
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(mockLogs, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting adapter logs: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );
} 