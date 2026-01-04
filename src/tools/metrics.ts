import { z } from 'zod';
import { ZhookClient } from '../zhook-client.js';

const client = new ZhookClient();

export const getHookMetricsTool = {
    name: "get_hook_metrics",
    description: "Get real-time metrics for a specific hook (request counts, success/failure rates).",
    inputSchema: z.object({
        hookId: z.string().describe("The ID of the hook"),
        timeWindow: z.enum(['hour', 'day', 'week']).default('hour').describe("Time window for metrics")
    }),
    handler: async (args: { hookId: string, timeWindow: string }) => {
        const result = await client.getHookMetrics(args.hookId, args.timeWindow);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

export const getAggregatedHookMetricsTool = {
    name: "get_aggregated_hook_metrics",
    description: "Get historical aggregated metrics for a specific hook with custom date ranges.",
    inputSchema: z.object({
        hookId: z.string(),
        startDate: z.string().optional().describe("ISO date string for start time"),
        endDate: z.string().optional().describe("ISO date string for end time"),
        groupBy: z.enum(['hour', 'day']).default('hour').describe("Granularity of aggregation")
    }),
    handler: async (args: { hookId: string, startDate?: string, endDate?: string, groupBy?: string }) => {
        const { hookId, ...query } = args;
        const result = await client.getAggregatedHookMetrics(args.hookId, query);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};
