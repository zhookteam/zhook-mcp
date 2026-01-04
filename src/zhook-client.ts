import axios from 'axios';
type AxiosInstance = ReturnType<typeof axios.create>;

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Zhook API Client
export class ZhookClient {
    private client: AxiosInstance;

    constructor() {
        const apiKey = process.env.ZHOOK_API_KEY;
        if (!apiKey) {
            throw new Error('ZHOOK_API_KEY environment variable is required');
        }

        const baseURL = process.env.ZHOOK_API_URL || 'https://api.zhook.dev/api/v1';

        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'zhook-mcp-server/1.0.0'
            }
        });
    }

    // Generic request wrapper
    async request<T>(method: string, url: string, data?: any, params?: any): Promise<T> {
        try {
            const response = await this.client.request<T>({
                method,
                url,
                data,
                params
            });
            return response.data;
        } catch (error: any) {
            if ((axios as any).isAxiosError(error) && (error as any).response) {
                throw new Error(`Zhook API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    // Hooks
    // Destinations
    async listDestinations(hookId: string) {
        return this.request('GET', `/hooks/${hookId}/destinations`);
    }

    async createDestination(hookId: string, data: any) {
        return this.request('POST', `/hooks/${hookId}/destinations`, data);
    }

    async getDestination(hookId: string, destinationId: string) {
        return this.request('GET', `/hooks/${hookId}/destinations/${destinationId}`);
    }

    async updateDestination(hookId: string, destinationId: string, data: any) {
        return this.request('PUT', `/hooks/${hookId}/destinations/${destinationId}`, data);
    }

    async deleteDestination(hookId: string, destinationId: string) {
        return this.request('DELETE', `/hooks/${hookId}/destinations/${destinationId}`);
    }

    // Transformations
    async listTransformations(hookId: string) {
        return this.request('GET', `/hooks/${hookId}/transformations`);
    }

    async createTransformation(hookId: string, data: any) {
        return this.request('POST', `/hooks/${hookId}/transformations`, data);
    }

    async updateTransformation(hookId: string, transformationId: string, data: any) {
        return this.request('PUT', `/hooks/${hookId}/transformations/${transformationId}`, data);
    }

    async deleteTransformation(hookId: string, transformationId: string) {
        return this.request('DELETE', `/hooks/${hookId}/transformations/${transformationId}`);
    }

    // Metrics
    async getHookMetrics(hookId: string, timeWindow: string = 'hour') {
        return this.request('GET', `/metrics/hooks/${hookId}?timeWindow=${timeWindow}`);
    }

    async getAggregatedHookMetrics(hookId: string, query: { startDate?: string, endDate?: string, groupBy?: string }) {
        const params = new URLSearchParams(query as any);
        return this.request('GET', `/metrics/hooks/${hookId}/aggregated?${params.toString()}`);
    }

    // Hooks
    async listHooks() {
        const result = await this.request<any>('GET', '/hooks');
        // Legacy domain fix: Ensure URLs use zhook.dev instead of hookr.cloud
        if (result && result.hooks) {
            result.hooks.forEach((h: any) => {
                if (h.url && h.url.includes('hookr.cloud')) {
                    h.url = h.url.replace('hookr.cloud', 'zhook.dev');
                }
                if (h.callbackUrl && h.callbackUrl.includes('hookr.cloud')) {
                    h.callbackUrl = h.callbackUrl.replace('hookr.cloud', 'zhook.dev');
                }
            });
        }
        return result;
    }

    async getHook(hookId: string) {
        const result = await this.request<any>('GET', `/hooks/${hookId}`);
        // Legacy domain fix
        if (result) {
            if (result.url && result.url.includes('hookr.cloud')) {
                result.url = result.url.replace('hookr.cloud', 'zhook.dev');
            }
            if (result.callbackUrl && result.callbackUrl.includes('hookr.cloud')) {
                result.callbackUrl = result.callbackUrl.replace('hookr.cloud', 'zhook.dev');
            }
        }
        return result;
    }

    async createHook(data: any) {
        return this.request('POST', '/hooks', data);
    }

    // Events
    async listEvents(hookId: string, limit: number = 10) {
        return this.request('GET', `/hooks/${hookId}/events`, undefined, { limit });
    }

    async getEvent(hookId: string, eventId: string) {
        return this.request('GET', `/hooks/${hookId}/events/${eventId}`);
    }

    // Webhooks (Testing)
    async triggerWebhook(hookId: string, payload: any, contentType: string = 'application/json') {
        console.error(`[ZhookClient] triggerWebhook called with hookId: ${hookId}, payload: ${JSON.stringify(payload)}`);
        const config = {
            headers: {
                'Content-Type': contentType
            }
        };

        // We need to hit the INGESTION endpoint (/h/:id) which is the public webhook receiver.
        // /hooks/:id is primarily for GET (details) or requires correct routing in server.js.
        // The user confirmed /h/:id is the correct path for POSTing webhooks.

        const baseUrl = this.client.defaults.baseURL || '';
        const rootUrl = baseUrl.replace(/\/api\/v1\/?$/, '');

        // Use the short URL /h/:id
        return this.client.post(`${rootUrl}/h/${hookId}`, payload, config);
    }
}
