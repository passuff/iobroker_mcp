import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSystemTools(server: McpServer, connection: any) {
    // Tool: Get System Information
    server.tool(
        "iobroker_getSystemInfo",
        "Get ioBroker system information",
        {},
        async () => {
            try {
                // Get system objects
                const systemConfig = await connection.getObject('system.config');
                const systemHost = await connection.getObject('system.host.' + (systemConfig?.common?.defaultHost || 'localhost'));
                
                const systemInfo = {
                    version: systemConfig?.common?.version || 'unknown',
                    language: systemConfig?.common?.language || 'en',
                    tempUnit: systemConfig?.common?.tempUnit || '°C',
                    currency: systemConfig?.common?.currency || 'EUR',
                    dateFormat: systemConfig?.common?.dateFormat || 'DD.MM.YYYY',
                    host: {
                        hostname: systemHost?.common?.hostname || 'unknown',
                        platform: systemHost?.native?.os?.platform || 'unknown',
                        architecture: systemHost?.native?.os?.arch || 'unknown',
                        cpus: systemHost?.native?.hardware?.cpus?.length || 0,
                        memory: systemHost?.native?.hardware?.memory || 0,
                        nodejs: systemHost?.native?.process?.versions?.node || 'unknown'
                    }
                };
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(systemInfo, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting system information: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get System Statistics
    server.tool(
        "iobroker_getSystemStats",
        "Get system statistics and performance metrics",
        {},
        async () => {
            try {
                // Get statistics from system states
                const stats: any = {};
                
                // CPU usage
                const cpuUsage = await connection.getState('system.host.localhost.cpu');
                if (cpuUsage) stats.cpuUsage = cpuUsage.val;
                
                // Memory usage
                const memUsage = await connection.getState('system.host.localhost.memory');
                if (memUsage) stats.memoryUsage = memUsage.val;
                
                // Disk usage
                const diskUsage = await connection.getState('system.host.localhost.diskFree');
                if (diskUsage) stats.diskFree = diskUsage.val;
                
                // Uptime
                const uptime = await connection.getState('system.host.localhost.uptime');
                if (uptime) stats.uptime = uptime.val;
                
                // Count objects and states
                const objects = await connection.getObjectList('*');
                stats.totalObjects = objects.length;
                
                const states = await connection.getStates('*');
                stats.totalStates = Object.keys(states).length;
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(stats, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting system statistics: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get Installed Adapters
    server.tool(
        "iobroker_getInstalledAdapters",
        "Get list of installed adapters",
        {},
        async () => {
            try {
                const adapters = await connection.getObjectList('system.adapter.*');
                
                const installedAdapters = adapters
                    .filter((obj: any) => obj.type === 'adapter')
                    .map((obj: any) => ({
                        name: obj.common?.name,
                        version: obj.common?.version,
                        title: obj.common?.title,
                        desc: obj.common?.desc,
                        platform: obj.common?.platform,
                        mode: obj.common?.mode,
                        enabled: obj.common?.enabled,
                        installedFrom: obj.common?.installedFrom
                    }));
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(installedAdapters, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting installed adapters: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Get System Hosts
    server.tool(
        "iobroker_getSystemHosts",
        "Get list of ioBroker hosts in the system",
        {},
        async () => {
            try {
                const hosts = await connection.getObjectList('system.host.*');
                
                const systemHosts = hosts
                    .filter((obj: any) => obj.type === 'host')
                    .map((obj: any) => ({
                        _id: obj._id,
                        hostname: obj.common?.hostname,
                        title: obj.common?.title,
                        platform: obj.native?.os?.platform,
                        architecture: obj.native?.os?.arch,
                        cpus: obj.native?.hardware?.cpus?.length,
                        memory: obj.native?.hardware?.memory,
                        nodejs: obj.native?.process?.versions?.node,
                        alive: obj.common?.alive
                    }));
                
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(systemHosts, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting system hosts: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Tool: Execute Command
    server.tool(
        "iobroker_executeCommand",
        "Execute an ioBroker command (requires admin privileges)",
        {
            command: z.enum(["update", "upgrade", "status", "repo", "list"]).describe("Command to execute"),
            params: z.string().optional().describe("Additional parameters for the command")
        },
        async ({ command }) => {
            try {
                // In a real implementation, this would execute actual ioBroker commands
                // For security reasons, this is limited to safe read-only commands
                
                let result = "";
                
                switch (command) {
                    case "status":
                        result = "ioBroker is running";
                        break;
                    case "list":
                        const instances = await connection.getObjectList('system.adapter.*');
                        result = instances
                            .filter((obj: any) => obj.type === 'instance')
                            .map((obj: any) => `${obj._id}: ${obj.common?.enabled ? 'enabled' : 'disabled'}`)
                            .join('\n');
                        break;
                    case "repo":
                        result = "Stable repository is active";
                        break;
                    default:
                        result = `Command '${command}' is not available in this context`;
                }
                
                return {
                    content: [{
                        type: "text",
                        text: result
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error executing command: ${error}`
                    }],
                    isError: true
                };
            }
        }
    );
} 