/*
 * Created with @iobroker/create-adapter v2.5.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Load your modules here, e.g.:
// import * as fs from "fs";

class McpServer extends utils.Adapter {
    private mcpServerProcess: ChildProcess | null = null;
    private mcpProxyProcess: ChildProcess | null = null;
    private requestCount = 0;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'mcp-server',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here

        // Reset the connection indicator during startup
        this.setState('info.connection', false, true);
        this.setState('info.clients', 0, true);
        this.setState('info.requests', 0, true);

        // Start MCP Server
        await this.startMcpServer();

        // Start MCP Proxy if enabled
        if (this.config.enableProxy) {
            await this.startMcpProxy();
        }

        // Subscribe to all states changes
        this.subscribeStates('*');
    }

    /**
     * Start the MCP server
     */
    private async startMcpServer(): Promise<void> {
        try {
            const serverPath = path.join(__dirname, '..', 'lib', 'mcp-server.js');
            
            // Check if server file exists
            if (!fs.existsSync(serverPath)) {
                this.log.error(`MCP server file not found at ${serverPath}`);
                return;
            }

            this.log.info(`Starting MCP server on stdio transport`);
            
            // Get ioBroker connection info
            const systemConfig = await this.getForeignObjectAsync('system.config');
            const host = systemConfig?.common?.host || 'localhost';
            const port = systemConfig?.common?.port || 8081;
            
            // Start the MCP server process
            this.mcpServerProcess = spawn('node', [serverPath], {
                env: {
                    ...process.env,
                    IOBROKER_NAMESPACE: this.namespace,
                    IOBROKER_HOST: host,
                    IOBROKER_PORT: String(port),
                    MCP_API_KEY: this.config.apiKey,
                    MCP_ENABLE_AUTH: String(this.config.enableAuthentication),
                },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.mcpServerProcess.stdout?.on('data', (data) => {
                this.log.debug(`MCP Server: ${data.toString()}`);
            });

            this.mcpServerProcess.stderr?.on('data', (data) => {
                this.log.error(`MCP Server Error: ${data.toString()}`);
            });

            this.mcpServerProcess.on('close', (code) => {
                this.log.info(`MCP Server process exited with code ${code}`);
                this.setState('info.connection', false, true);
            });

            // Give the server time to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.setState('info.connection', true, true);
            this.log.info('MCP server started successfully');

        } catch (error) {
            this.log.error(`Failed to start MCP server: ${error}`);
            this.setState('info.connection', false, true);
        }
    }

    /**
     * Start the MCP proxy
     */
    private async startMcpProxy(): Promise<void> {
        try {
            this.log.info(`Starting MCP proxy on port ${this.config.proxyPort}`);
            
            const serverPath = path.join(__dirname, '..', 'lib', 'mcp-server.js');
            
            // Get ioBroker connection info
            const systemConfig = await this.getForeignObjectAsync('system.config');
            const host = systemConfig?.common?.host || 'localhost';
            const port = systemConfig?.common?.port || 8081;
            
            // Start the MCP proxy process
            this.mcpProxyProcess = spawn('mcp-proxy', [
                '--port', String(this.config.proxyPort),
                '--host', '0.0.0.0',
                '--allow-origin', '*',
                'node', serverPath
            ], {
                env: {
                    ...process.env,
                    IOBROKER_NAMESPACE: this.namespace,
                    IOBROKER_HOST: host,
                    IOBROKER_PORT: String(port),
                    MCP_API_KEY: this.config.apiKey,
                    MCP_ENABLE_AUTH: String(this.config.enableAuthentication),
                }
            });

            this.mcpProxyProcess.stdout?.on('data', (data) => {
                this.log.debug(`MCP Proxy: ${data.toString()}`);
            });

            this.mcpProxyProcess.stderr?.on('data', (data) => {
                this.log.warn(`MCP Proxy Warning: ${data.toString()}`);
            });

            this.mcpProxyProcess.on('close', (code) => {
                this.log.info(`MCP Proxy process exited with code ${code}`);
            });

            this.log.info('MCP proxy started successfully');

        } catch (error) {
            this.log.error(`Failed to start MCP proxy: ${error}`);
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            // Stop MCP server
            if (this.mcpServerProcess) {
                this.log.info('Stopping MCP server...');
                this.mcpServerProcess.kill();
                this.mcpServerProcess = null;
            }

            // Stop MCP proxy
            if (this.mcpProxyProcess) {
                this.log.info('Stopping MCP proxy...');
                this.mcpProxyProcess.kill();
                this.mcpProxyProcess = null;
            }

            this.setState('info.connection', false, true);
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     */
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed object changes
     */
    private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Some message was sent to this instance over message box
     */
    private onMessage(obj: ioBroker.Message): void {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.log.info('send command');

                // Send response in callback if required
                if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
            }
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new McpServer(options);
} else {
    // otherwise start the instance directly
    (() => new McpServer())();
} 