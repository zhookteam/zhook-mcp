import { ZhookClient } from './zhook-client.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const client = new ZhookClient();
    try {
        console.log("Fetching hooks...");
        const result: any = await client.listHooks();
        console.log("--- Your Hooks ---");
        if (result.hooks && result.hooks.length > 0) {
            result.hooks.forEach((h: any) => {
                console.log(`- [${h.hookId}] ${h.metadata?.name || 'Unnamed'} (${h.url}) - Active: ${h.active}`);
            });
        } else {
            console.log("No hooks found.");
        }
        console.log("------------------");
    } catch (error: any) {
        console.error("Error fetching hooks:", error.message);
    }
}

main();
