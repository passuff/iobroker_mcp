import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerObjectTools(server: McpServer, connection: any) {
    // Tool: Get Object
    server.tool(
        "iobroker_getObject",
        "Get an ioBroker object",
        {
            id: z.string().describe("Object ID")
        },
        async ({ id }) => {
            try {
                const obj = await connection.getObject(id);
                
                if (!obj) {
                    return {
                        content: [{
                            type: "text",
                            text: `Object ${id} not found`
                        }]
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(obj, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting object ${id}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get Object List
    server.tool(
        "iobroker_getObjectList",
        "List ioBroker objects",
        {
            pattern: z.string().optional().describe("Filter pattern (e.g., 'system.adapter.*')"),
            type: z.string().optional().describe("Object type filter (e.g., 'state', 'channel', 'device')")
        },
        async ({ pattern, type }) => {
            try {
                const objects = await connection.getObjectList(pattern || '*');
                
                let filteredObjects = objects;
                if (type) {
                    filteredObjects = objects.filter((obj: any) => obj.type === type);
                }
                
                if (filteredObjects.length === 0) {
                    return {
                        content: [{
                            type: "text",
                            text: `No objects found${pattern ? ` matching pattern: ${pattern}` : ''}${type ? ` with type: ${type}` : ''}`
                        }]
                    };
                }
                
                const objectList = filteredObjects.map((obj: any) => ({
                    _id: obj._id,
                    type: obj.type,
                    common: {
                        name: obj.common?.name,
                        role: obj.common?.role,
                        type: obj.common?.type
                    }
                }));
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(objectList, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting object list: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Create Object
    server.tool(
        "iobroker_createObject",
        "Create a new ioBroker object",
        {
            id: z.string().describe("Object ID"),
            type: z.enum(["state", "channel", "device", "folder"]).describe("Object type"),
            common: z.object({
                name: z.string().describe("Object name"),
                role: z.string().optional().describe("Object role"),
                type: z.string().optional().describe("Value type for states"),
                read: z.boolean().optional().describe("Read permission"),
                write: z.boolean().optional().describe("Write permission"),
                unit: z.string().optional().describe("Unit for states"),
                min: z.number().optional().describe("Minimum value"),
                max: z.number().optional().describe("Maximum value")
            }).describe("Common object properties"),
            native: z.record(z.any()).optional().describe("Native object properties")
        },
        async ({ id, type, common, native }) => {
            try {
                const obj = {
                    _id: id,
                    type,
                    common,
                    native: native || {}
                };
                
                const success = await connection.setObject(id, obj);
                
                if (!success) {
                    return {
                        content: [{
                            type: "text",
                            text: `Failed to create object ${id}`
                        }],
                        isError: true
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: `Successfully created object ${id} of type ${type}`
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error creating object ${id}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Update Object
    server.tool(
        "iobroker_updateObject",
        "Update an existing ioBroker object",
        {
            id: z.string().describe("Object ID"),
            common: z.record(z.any()).optional().describe("Common properties to update"),
            native: z.record(z.any()).optional().describe("Native properties to update")
        },
        async ({ id, common, native }) => {
            try {
                const existingObj = await connection.getObject(id);
                
                if (!existingObj) {
                    return {
                        content: [{
                            type: "text",
                            text: `Object ${id} not found`
                        }],
                        isError: true
                    };
                }
                
                // Merge updates
                if (common) {
                    existingObj.common = { ...existingObj.common, ...common };
                }
                if (native) {
                    existingObj.native = { ...existingObj.native, ...native };
                }
                
                const success = await connection.setObject(id, existingObj);
                
                if (!success) {
                    return {
                        content: [{
                            type: "text",
                            text: `Failed to update object ${id}`
                        }],
                        isError: true
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: `Successfully updated object ${id}`
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error updating object ${id}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Delete Object
    server.tool(
        "iobroker_deleteObject",
        "Delete an ioBroker object",
        {
            id: z.string().describe("Object ID to delete")
        },
        async ({ id }) => {
            try {
                const success = await connection.deleteObject(id);
                
                if (!success) {
                    return {
                        content: [{
                            type: "text",
                            text: `Failed to delete object ${id}`
                        }],
                        isError: true
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: `Successfully deleted object ${id}`
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error deleting object ${id}: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );
} 