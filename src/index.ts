#!/usr/bin/env node

// 1. SILENCE STDOUT IMMEDIATELY
// Redirect console.log to console.error to keep stdout pure for JSON-RPC
const originalLog = console.log;
console.log = console.error;

// 2. Imports (Dynamic to ensure silence first)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";

async function main() {
    // Dynamic imports to prevent top-level side effects from polluting stdout
    // We import these HERE, after the console override is active.
    const HookTools = await import('./tools/hooks.js');
    const EventTools = await import('./tools/events.js');
    const DestinationTools = await import('./tools/destinations.js');
    const TransformationTools = await import('./tools/transformations.js');
    const MetricTools = await import('./tools/metrics.js');
    const WebhookTools = await import('./tools/webhooks.js');

    // Create server instance
    const server = new McpServer({
        name: "zhook-mcp-server",
        version: "1.0.0",
    });

    // Helper to convert Zod schema to clean JSON Schema for MCP
    const toMcpSchema = (schema: any) => {
        const jsonSchema = zodToJsonSchema(schema);
        // Remove $schema field as it can cause validation issues in some SDK versions if mismatch
        if ('$schema' in jsonSchema) {
            delete (jsonSchema as any)['$schema'];
        }
        return jsonSchema;
    };

    // Register Webhook Test Tool
    // Register Webhook Test Tool using explicit registerTool structure to avoid ambiguity
    // and ensuring we pass the Zod schema directly.
    console.error("Registering trigger_webhook with inputSchema:", WebhookTools.triggerWebhookTool.inputSchema);

    server.registerTool(
        WebhookTools.triggerWebhookTool.name,
        {
            description: WebhookTools.triggerWebhookTool.description,
            inputSchema: WebhookTools.triggerWebhookTool.inputSchema,
        },
        WebhookTools.triggerWebhookTool.handler as any
    );

    // Register Hook Tools
    // Register Hook Tools
    server.registerTool(
        HookTools.listHooksTool.name,
        {
            description: HookTools.listHooksTool.description,
            inputSchema: HookTools.listHooksTool.inputSchema,
        },
        HookTools.listHooksTool.handler as any
    );

    server.registerTool(
        HookTools.createHookTool.name,
        {
            description: HookTools.createHookTool.description,
            inputSchema: HookTools.createHookTool.inputSchema,
        },
        HookTools.createHookTool.handler as any
    );

    server.registerTool(
        HookTools.getHookTool.name,
        {
            description: HookTools.getHookTool.description,
            inputSchema: HookTools.getHookTool.inputSchema,
        },
        HookTools.getHookTool.handler as any
    );

    // Register Destination Tools
    server.registerTool(
        DestinationTools.listDestinationsTool.name,
        {
            description: DestinationTools.listDestinationsTool.description,
            inputSchema: DestinationTools.listDestinationsTool.inputSchema,
        },
        DestinationTools.listDestinationsTool.handler as any
    );

    server.registerTool(
        DestinationTools.createDestinationTool.name,
        {
            description: DestinationTools.createDestinationTool.description,
            inputSchema: DestinationTools.createDestinationTool.inputSchema,
        },
        DestinationTools.createDestinationTool.handler as any
    );

    server.registerTool(
        DestinationTools.getDestinationTool.name,
        {
            description: DestinationTools.getDestinationTool.description,
            inputSchema: DestinationTools.getDestinationTool.inputSchema,
        },
        DestinationTools.getDestinationTool.handler as any
    );

    server.registerTool(
        DestinationTools.updateDestinationTool.name,
        {
            description: DestinationTools.updateDestinationTool.description,
            inputSchema: DestinationTools.updateDestinationTool.inputSchema,
        },
        DestinationTools.updateDestinationTool.handler as any
    );

    server.registerTool(
        DestinationTools.deleteDestinationTool.name,
        {
            description: DestinationTools.deleteDestinationTool.description,
            inputSchema: DestinationTools.deleteDestinationTool.inputSchema,
        },
        DestinationTools.deleteDestinationTool.handler as any
    );

    // Register Transformation Tools
    server.registerTool(
        TransformationTools.listTransformationsTool.name,
        {
            description: TransformationTools.listTransformationsTool.description,
            inputSchema: TransformationTools.listTransformationsTool.inputSchema,
        },
        TransformationTools.listTransformationsTool.handler as any
    );

    server.registerTool(
        TransformationTools.createTransformationTool.name,
        {
            description: TransformationTools.createTransformationTool.description,
            inputSchema: TransformationTools.createTransformationTool.inputSchema,
        },
        TransformationTools.createTransformationTool.handler as any
    );

    server.registerTool(
        TransformationTools.updateTransformationTool.name,
        {
            description: TransformationTools.updateTransformationTool.description,
            inputSchema: TransformationTools.updateTransformationTool.inputSchema,
        },
        TransformationTools.updateTransformationTool.handler as any
    );

    server.registerTool(
        TransformationTools.deleteTransformationTool.name,
        {
            description: TransformationTools.deleteTransformationTool.description,
            inputSchema: TransformationTools.deleteTransformationTool.inputSchema,
        },
        TransformationTools.deleteTransformationTool.handler as any
    );

    // Register Metric Tools
    server.registerTool(
        MetricTools.getHookMetricsTool.name,
        {
            description: MetricTools.getHookMetricsTool.description,
            inputSchema: MetricTools.getHookMetricsTool.inputSchema,
        },
        MetricTools.getHookMetricsTool.handler as any
    );

    server.registerTool(
        MetricTools.getAggregatedHookMetricsTool.name,
        {
            description: MetricTools.getAggregatedHookMetricsTool.description,
            inputSchema: MetricTools.getAggregatedHookMetricsTool.inputSchema,
        },
        MetricTools.getAggregatedHookMetricsTool.handler as any
    );

    // Register Event Tools
    server.registerTool(
        EventTools.listEventsTool.name,
        {
            description: EventTools.listEventsTool.description,
            inputSchema: EventTools.listEventsTool.inputSchema,
        },
        EventTools.listEventsTool.handler as any
    );

    server.registerTool(
        EventTools.getEventTool.name,
        {
            description: EventTools.getEventTool.description,
            inputSchema: EventTools.getEventTool.inputSchema,
        },
        EventTools.getEventTool.handler as any
    );

    server.registerTool(
        EventTools.waitForEventTool.name,
        {
            description: EventTools.waitForEventTool.description,
            inputSchema: EventTools.waitForEventTool.inputSchema,
        },
        EventTools.waitForEventTool.handler as any
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    process.exit(1);
});
