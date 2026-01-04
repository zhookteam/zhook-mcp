import { z } from 'zod';
import { ZhookClient } from '../zhook-client.js';

const apiClient = new ZhookClient();

const triggerWebhookSchema = z.object({
    hookId: z.string().optional().describe("The ID of the hook to trigger (preferred)"),
    hook_id: z.string().optional().describe("Alias for hookId"),
    payload: z.string().describe("The payload to send. Can be a JSON object, a JSON string, or just plain text."),
    contentType: z.enum(['application/json', 'text/plain']).default('application/json').describe("Content-Type of the webhook (default: application/json)")
});

export const triggerWebhookTool = {
    name: "trigger_webhook",
    description: "Send a test webhook event to a specific Hook. This mimics a real third-party service sending data to the hook URL.",
    inputSchema: triggerWebhookSchema,
    handler: async (args: any, extra: any) => {
        console.error('[TriggerWebhook] First Arg (args):', JSON.stringify(args, null, 2));
        console.error('[TriggerWebhook] Second Arg (extra):', JSON.stringify(extra, null, 2));

        // Handle potentially shifted arguments (if args is actually extra, where is args?)
        // If args has 'signal' etc, it's likely 'extra'.

        let actualArgs = args;
        if (args && args.sessionId && args.requestId) {
            console.error('[TriggerWebhook] First arg looks like context/extra! Args might be missing or shifted.');
            // If the first arg is extra, maybe the args are undefined/empty?
            // Or maybe we are using the wrong handler signature for the defined schema?
        }

        const normalizedArgs: any = {};
        if (actualArgs) {
            for (const key of Object.keys(actualArgs)) {
                normalizedArgs[key.toLowerCase()] = actualArgs[key];
            }
        }

        const resolvedHookId = normalizedArgs.hookid || normalizedArgs.hook_id;
        const resolvedPayload = normalizedArgs.payload;
        const resolvedContentType = normalizedArgs.contenttype || 'application/json';

        if (!resolvedHookId) {
            return {
                isError: true,
                content: [{
                    type: "text",
                    text: `Failed to trigger webhook: hookId (or hook_id) is required. Received keys: ${Object.keys(args).join(', ')}`
                }]
            };
        }

        try {
            const result = await apiClient.triggerWebhook(resolvedHookId, resolvedPayload, resolvedContentType);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        status: result.status,
                        data: result.data
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            // Extract request details if available
            const config = error.config || {};
            const requestUrl = config.url || 'unknown';
            const baseURL = config.baseURL || 'unknown';
            const method = config.method || 'unknown';

            return {
                isError: true,
                content: [{
                    type: "text",
                    text: `Failed to trigger webhook.
Error: ${error.message}
Status: ${error.response?.status} ${error.response?.statusText}
Method: ${method.toUpperCase()}
Attempted URL: ${requestUrl}
Base URL: ${baseURL}
Data: ${JSON.stringify(error.response?.data || {}, null, 2)}`
                }]
            };
        }
    }
};
