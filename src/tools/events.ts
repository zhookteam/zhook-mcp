import { z } from 'zod';
import { ZhookClient } from '../zhook-client.js';
// import { ZhookClient as RealtimeClient } from '@zhook/client';

const apiClient = new ZhookClient();

export const listEventsTool = {
    name: "list_events",
    description: "List recent events received by a specific hook. Useful for checking what payloads have been delivered.",
    inputSchema: z.object({
        hookId: z.string().describe("The ID of the hook to inspect"),
        limit: z.number().max(50).default(5).describe("Number of events to return (max 50, default 5)")
    }),
    handler: async (args: { hookId: string, limit: number }) => {
        const result: any = await apiClient.listEvents(args.hookId, args.limit);

        // Summary view to save context tokens
        const summary = result.events.map((e: any) => ({
            eventId: e.eventId,
            receivedAt: e.receivedAt,
            method: e.method,
            contentType: e.contentType,
            size: e.contentLength
        }));

        return {
            content: [{
                type: "text",
                text: JSON.stringify(summary, null, 2)
            }]
        };
    }
};

export const getEventTool = {
    name: "get_event",
    description: "Get the full JSON payload and details of a specific event.",
    inputSchema: z.object({
        hookId: z.string().describe("The hook ID"),
        eventId: z.string().describe("The event ID to retrieve")
    }),
    handler: async (args: { hookId: string, eventId: string }) => {
        const result = await apiClient.getEvent(args.hookId, args.eventId);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

export const waitForEventTool = {
    name: "wait_for_event",
    description: "Connects to the Zhook WebSocket and waits for the NEXT event to arrive on a specific hook. Returns the full event payload immediately. TIMEOUT is 60 seconds.",
    inputSchema: z.object({
        hookId: z.string().describe("The hook ID to watch"),
        timeoutSeconds: z.number().default(60).describe("How long to wait before giving up")
    }),
    handler: async (args: { hookId: string, timeoutSeconds: number }) => {
        const apiKey = process.env.ZHOOK_API_KEY;
        if (!apiKey) {
            throw new Error("ZHOOK_API_KEY not set");
        }

        let wsUrl = process.env.ZHOOK_WS_URL || 'wss://api.zhook.dev/events';
        // Ensure URL ends with /events if it's the standard API domain
        if (!wsUrl.endsWith('/events') && !wsUrl.endsWith('/')) {
            wsUrl += '/events';
        }

        // Try to find a subscriber key for this hook
        let clientKey = apiKey;
        try {
            const hookDetails: any = await apiClient.getHook(args.hookId);
            if (hookDetails && hookDetails.keys && Array.isArray(hookDetails.keys) && hookDetails.keys.length > 0) {
                clientKey = hookDetails.keys[0].key || hookDetails.keys[0];
            } else if (hookDetails && hookDetails.subscriberKey) {
                clientKey = hookDetails.subscriberKey;
            }
        } catch (err) {
            console.error("Failed to fetch hook details for key lookup, using API Key", err);
        }

        return new Promise(async (resolve, reject) => {
            // Initialize Realtime Client
            // Corrected usage: RealtimeClient(clientKey, options)
            let RealtimeClient;
            try {
                const pkg = await import('@zhook/client');
                RealtimeClient = pkg.ZhookClient;
            } catch (e) {
                // Dynamically import failed
                resolve({
                    content: [{ type: "text", text: "Error loading client library: " + (e as any).message }]
                });
                return;
            }

            const realtime = new RealtimeClient(clientKey, {
                wsUrl: wsUrl,
                project: 'default'
            } as any);

            // Setup Timeout
            const timer = setTimeout(() => {
                try {
                    (realtime as any).disconnect(); // Or close() if specific method name
                    // Based on source code it has 'close()' or 'disconnect' might mean close in logic
                    // Checking source: it has 'close()'. 'disconnect' is not a method on ZhookClient class.
                    realtime.close();
                } catch (e) { /* ignore */ }

                resolve({
                    content: [{
                        type: "text",
                        text: "Timeout: No event received within " + args.timeoutSeconds + " seconds."
                    }]
                });
            }, args.timeoutSeconds * 1000);

            // Handle Events
            const onEvent = (data: any) => {
                // We only care about events for THIS hook
                if (data.hookId === args.hookId) {
                    clearTimeout(timer);
                    try { realtime.close(); } catch (e) { }

                    resolve({
                        content: [{
                            type: "text",
                            text: JSON.stringify(data, null, 2)
                        }]
                    });
                }
            };

            // Setup Listeners
            // Source says: onHookCalled(handler) for webhook events
            // Source says: onConnected(handler), onError(handler)
            // It does NOT have .on('event', ...). The class does NOT extend EventEmitter.
            // It has .handlers array and explicit methods.

            realtime.onHookCalled(onEvent);

            realtime.onError((err: any) => {
                // Silent error handling
            });

            // Connect
            realtime.connect().catch((err: any) => {
                clearTimeout(timer);
                resolve({
                    content: [{ type: "text", text: "Error connecting to realtime: " + err.message }]
                });
            });
        });
    }
};
