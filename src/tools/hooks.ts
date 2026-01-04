import { z } from 'zod';
import { ZhookClient } from '../zhook-client.js';

const client = new ZhookClient();

export const listHooksTool = {
    name: "list_hooks",
    description: "List all webhooks configured in the Zhook account. Returns hook IDs, URLs, and active status.",
    inputSchema: z.object({}),
    handler: async () => {
        const result: any = await client.listHooks();

        // Format for easier reading by LLM
        const summarized = result.hooks.map((h: any) => ({
            id: h.hookId,
            name: h.metadata?.name || 'Unnamed Hook',
            url: h.url,
            type: h.type || 'standard',
            deliveryMethod: h.deliveryMethod,
            active: h.active,
            status: h.status
        }));

        return {
            content: [{
                type: "text",
                text: JSON.stringify(summarized, null, 2)
            }]
        };
    }
};

export const getHookTool = {
    name: "get_hook",
    description: "Get detailed configuration for a specific webhook, including delivery URL, metadata, and recent metrics.",
    inputSchema: z.object({
        hookId: z.string().describe("The ID of the hook to retrieve (e.g. hook_abc123)")
    }),
    handler: async (args: { hookId: string }) => {
        console.error('[GetHook] Args received:', JSON.stringify(args));
        const result = await client.getHook(args.hookId);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

const createHookSchema = z.object({
    type: z.enum(['standard', 'mqtt']).default('standard').describe("The type of hook to create. Use 'mqtt' to create an MQTT source hook."),
    deliveryMethod: z.enum(['http', 'websocket', 'both']).default('websocket').describe("How you want to receive events. Defaults to 'websocket' for easy testing."),
    callbackUrl: z.string().url().optional().describe("Required if deliveryMethod is 'http' or 'both'."),
    metadata: z.record(z.string(), z.any()).optional().describe("Optional key-value metadata to attach to the hook (name, tags)."),
    sourceConfig: z.object({
        topic: z.string().describe("MQTT Topic to subscribe to (required for type=mqtt)"),
        brokerUrl: z.string().optional().describe("MQTT Broker URL"),
        username: z.string().optional(),
        password: z.string().optional()
    }).optional().describe("Configuration for MQTT source. Required if type is 'mqtt'.")
});

export const createHookTool = {
    name: "create_hook",
    description: "Create a new webhook or MQTT hook. Returns the new hook ID and its public URL.",
    inputSchema: createHookSchema,
    handler: async (args: z.infer<typeof createHookSchema>) => {
        // Basic validation logic that might save an API call
        if (args.type === 'mqtt' && !args.sourceConfig) {
            throw new Error("sourceConfig is required when type is 'mqtt'");
        }

        // Explicitly handle defaults if Zod doesn't apply them automatically in the handler context
        const deliveryMethod = args.deliveryMethod || 'websocket';
        const type = args.type === 'standard' || !args.type ? 'http' : args.type;

        const payload: any = {
            type,
            deliveryMethod,
            callbackUrl: args.callbackUrl,
            metadata: args.metadata,
            sourceConfig: args.sourceConfig
        };

        // Fix for MQTT source config: map brokerUrl -> url
        if (type === 'mqtt' && payload.sourceConfig && payload.sourceConfig.brokerUrl) {
            payload.sourceConfig.url = payload.sourceConfig.brokerUrl;
            delete payload.sourceConfig.brokerUrl;
        }

        const result = await client.createHook(payload);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};
