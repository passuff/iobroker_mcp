// This file extends the AdapterConfig type from the adapter core
// and is used to strongly type the adapter config object
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ioBroker {
        interface AdapterConfig {
            // Server configuration
            port: number;
            enableProxy: boolean;
            proxyPort: number;
            
            // Security
            enableAuthentication: boolean;
            apiKey: string;
            
            // Tool configuration
            enabledTools: {
                states: boolean;
                objects: boolean;
                adapters: boolean;
                system: boolean;
            };
            
            // Filters
            stateFilter: string;
            objectFilter: string;
            
            // Advanced
            logLevel: string;
            requestTimeout: number;
            maxConcurrentRequests: number;
        }
        
        // Extend SystemConfigCommon to include host and port
        interface SystemConfigCommon {
            host?: string;
            port?: number;
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {}; 