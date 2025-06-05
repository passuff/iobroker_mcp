import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerStateTools(server: McpServer, connection: any) {
    // Tool: Get State
    server.tool(
        "iobroker_getState",
        "Get the value of an ioBroker state",
        {
            id: z.string().describe("State ID (e.g., 'system.adapter.admin.0.alive')")
        },
        async ({ id }) => {
            try {
                // Use getForeignState for all states to access states from other adapters
                const state = await connection.getForeignState(id);
                
                if (!state) {
                    return {
                        content: [{
                            type: "text",
                            text: `State ${id} not found or has no value`
                        }]
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            id,
                            val: state.val,
                            ack: state.ack,
                            ts: state.ts,
                            lc: state.lc,
                            from: state.from,
                            q: state.q,
                            expire: state.expire,
                            c: state.c
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting state ${id}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Set State
    server.tool(
        "iobroker_setState",
        "Set the value of an ioBroker state",
        {
            id: z.string().describe("State ID"),
            value: z.any().describe("Value to set"),
            ack: z.boolean().optional().describe("Acknowledged flag (default: false)")
        },
        async ({ id, value, ack = false }) => {
            try {
                // Use setForeignState to allow setting states of other adapters
                await connection.setForeignState(id, value, ack);
                
                return {
                    content: [{
                        type: "text",
                        text: `Successfully set state ${id} to ${JSON.stringify(value)} (ack: ${ack})`
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error setting state ${id}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get States Pattern
    server.tool(
        "iobroker_getStates",
        "Get multiple states matching a pattern",
        {
            pattern: z.string().describe("State pattern (e.g., 'hm-rpc.0.*')")
        },
        async ({ pattern }) => {
            try {
                const states = await connection.getStatesPattern(pattern);
                
                if (!states || Object.keys(states).length === 0) {
                    return {
                        content: [{
                            type: "text",
                            text: `No states found matching pattern: ${pattern}`
                        }]
                    };
                }
                
                const stateList = Object.entries(states).map(([id, state]: [string, any]) => ({
                    id,
                    val: state?.val,
                    ack: state?.ack,
                    ts: state?.ts,
                    lc: state?.lc,
                    from: state?.from,
                    q: state?.q
                }));
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(stateList, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting states with pattern ${pattern}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Subscribe to State Changes
    server.tool(
        "iobroker_subscribeState",
        "Subscribe to state changes (returns subscription ID)",
        {
            pattern: z.string().describe("State pattern (e.g., 'hm-rpc.0.*')")
        },
        async ({ pattern }) => {
            try {
                // In a real implementation, this would set up a subscription
                // For now, we just acknowledge the request
                const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                // Note: Actual subscription would require WebSocket or SSE connection
                connection.log.info(`Subscription requested for pattern: ${pattern}`);
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            subscriptionId,
                            pattern,
                            status: "acknowledged",
                            message: "Subscription acknowledged. Note: Real-time updates require WebSocket/SSE connection."
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error creating subscription for pattern ${pattern}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get State History
    server.tool(
        "iobroker_getStateHistory",
        "Get historical values of a state",
        {
            id: z.string().describe("State ID"),
            start: z.string().optional().describe("Start time (ISO 8601 format)"),
            end: z.string().optional().describe("End time (ISO 8601 format)"),
            count: z.number().optional().default(100).describe("Maximum number of values to return")
        },
        async ({ id, start, end, count }) => {
            try {
                // Check if history adapter is available
                const historyInstances = await connection.getForeignObjects('system.adapter.history.*', 'instance');
                const influxInstances = await connection.getForeignObjects('system.adapter.influxdb.*', 'instance');
                const sqlInstances = await connection.getForeignObjects('system.adapter.sql.*', 'instance');
                
                const hasHistory = Object.keys(historyInstances).length > 0 || 
                                 Object.keys(influxInstances).length > 0 || 
                                 Object.keys(sqlInstances).length > 0;
                
                if (!hasHistory) {
                    return {
                        content: [{
                            type: "text",
                            text: "No history adapter (history, influxdb, or sql) is installed or enabled"
                        }]
                    };
                }
                
                // Note: Actual history retrieval would require sendTo() to history adapter
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            message: "History retrieval requires direct communication with history adapter",
                            id,
                            start: start || "not specified",
                            end: end || "not specified",
                            count,
                            hint: "Use the appropriate history adapter's API or admin interface for historical data"
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting state history: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get State Info
    server.tool(
        "iobroker_getStateInfo",
        "Get detailed information about a state including its object definition",
        {
            id: z.string().describe("State ID")
        },
        async ({ id }) => {
            try {
                // Get both state and object information
                const [state, obj] = await Promise.all([
                    connection.getForeignState(id),
                    connection.getForeignObject(id)
                ]);
                
                const result: any = {
                    id,
                    exists: false,
                    state: null,
                    object: null
                };
                
                if (state) {
                    result.exists = true;
                    result.state = {
                        val: state.val,
                        ack: state.ack,
                        ts: state.ts,
                        lc: state.lc,
                        from: state.from,
                        q: state.q,
                        expire: state.expire
                    };
                }
                
                if (obj) {
                    result.object = {
                        type: obj.type,
                        common: obj.common,
                        native: obj.native
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting state info for ${id}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );
} 