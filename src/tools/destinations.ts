import { z } from 'zod';
import { ZhookClient } from '../zhook-client.js';

const client = new ZhookClient();

export const listDestinationsTool = {
    name: "list_destinations",
    description: "List all destinations configured for a specific webhook.",
    inputSchema: z.object({
        hookId: z.string().describe("The ID of the hook to list destinations for")
    }),
    handler: async (args: { hookId: string }) => {
        const result: any = await client.listDestinations(args.hookId);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

export const getDestinationTool = {
    name: "get_destination",
    description: "Get detailed configuration for a specific destination.",
    inputSchema: z.object({
        hookId: z.string().describe("The ID of the hook"),
        destinationId: z.string().describe("The ID of the destination")
    }),
    handler: async (args: { hookId: string, destinationId: string }) => {
        const result = await client.getDestination(args.hookId, args.destinationId);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

const destinationConfigSchema = z.object({
    type: z.enum(['http', 'mqtt', 'email']).describe("Type of destination"),
    config: z.object({
        // HTTP
        url: z.string().url().optional().describe("Target URL (HTTP only)"),
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).optional().default('POST').describe("HTTP Method"),
        headers: z.record(z.string(), z.string()).optional().describe("HTTP Headers"),

        // MQTT
        brokerUrl: z.string().optional().describe("MQTT Broker URL (e.g., mqtt://broker.hivemq.com)"),
        topic: z.string().optional().describe("MQTT Topic"),
        qos: z.number().min(0).max(2).optional().default(0),

        // Email
        email: z.string().email().optional().describe("Email address to send to")
    }).describe("Configuration object specific to the destination type"),
    name: z.string().optional().describe("Friendly name for this destination")
});

export const createDestinationTool = {
    name: "create_destination",
    description: "Add a new destination to a hook to forward events to.",
    inputSchema: z.object({
        hookId: z.string().describe("The ID of the hook"),
        ...destinationConfigSchema.shape
    }),
    handler: async (args: z.infer<typeof destinationConfigSchema> & { hookId: string }) => {
        const payload = {
            type: args.type,
            config: args.config,
            name: args.name
        };
        const result = await client.createDestination(args.hookId, payload);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

export const updateDestinationTool = {
    name: "update_destination",
    description: "Update an existing destination's configuration.",
    inputSchema: z.object({
        hookId: z.string(),
        destinationId: z.string(),
        ...destinationConfigSchema.partial().shape,
        active: z.boolean().optional().describe("Enable or disable this destination")
    }),
    handler: async (args: any) => {
        const { hookId, destinationId, ...data } = args;
        const result = await client.updateDestination(hookId, destinationId, data);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

export const deleteDestinationTool = {
    name: "delete_destination",
    description: "Remove a destination from a hook.",
    inputSchema: z.object({
        hookId: z.string(),
        destinationId: z.string()
    }),
    handler: async (args: { hookId: string, destinationId: string }) => {
        await client.deleteDestination(args.hookId, args.destinationId);
        return {
            content: [{
                type: "text",
                text: `Destination ${args.destinationId} deleted successfully.`
            }]
        };
    }
};
