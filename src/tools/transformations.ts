import { z } from 'zod';
import { ZhookClient } from '../zhook-client.js';

const client = new ZhookClient();

export const listTransformationsTool = {
    name: "list_transformations",
    description: "List all transformations configured for a specific webhook.",
    inputSchema: z.object({
        hookId: z.string().describe("The ID of the hook")
    }),
    handler: async (args: { hookId: string }) => {
        const result: any = await client.listTransformations(args.hookId);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

const transformationSchema = z.object({
    name: z.string().describe("Name of the transformation"),
    code: z.string().describe("JSONata transformation code"),
    active: z.boolean().optional().default(true)
});

export const createTransformationTool = {
    name: "create_transformation",
    description: "Create a new JSONata transformation for a hook.",
    inputSchema: z.object({
        hookId: z.string(),
        ...transformationSchema.shape
    }),
    handler: async (args: any) => {
        const { hookId, ...data } = args;
        const result = await client.createTransformation(hookId, data);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

export const updateTransformationTool = {
    name: "update_transformation",
    description: "Update an existing transformation.",
    inputSchema: z.object({
        hookId: z.string(),
        transformationId: z.string(),
        ...transformationSchema.partial().shape
    }),
    handler: async (args: any) => {
        const { hookId, transformationId, ...data } = args;
        const result = await client.updateTransformation(hookId, transformationId, data);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
};

export const deleteTransformationTool = {
    name: "delete_transformation",
    description: "Delete a transformation from a hook.",
    inputSchema: z.object({
        hookId: z.string(),
        transformationId: z.string()
    }),
    handler: async (args: { hookId: string, transformationId: string }) => {
        await client.deleteTransformation(args.hookId, args.transformationId);
        return {
            content: [{
                type: "text",
                text: `Transformation ${args.transformationId} deleted successfully.`
            }]
        };
    }
};
