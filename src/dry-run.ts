import { ZhookClient } from './zhook-client.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log("🚀 Starting Zhook MCP Server Dry Run...");

    const apiKey = process.env.ZHOOK_API_KEY;
    if (!apiKey) {
        console.error("❌ Error: ZHOOK_API_KEY is not set in environment or .env file.");
        process.exit(1);
    }

    const client = new ZhookClient();

    try {
        // 1. List Hooks
        console.log("\n1️⃣  Listing Hooks...");
        const hooks = await client.listHooks() as any;
        console.log(`   ✅ Found ${hooks.hooks.length} hooks.`);

        // 2. Create a Test Hook
        console.log("\n2️⃣  Creating Test Hook...");
        const newHook = await client.createHook({
            type: 'standard',
            deliveryMethod: 'http',
            metadata: {
                name: 'MCP Dry Run Hook',
                test: true
            }
        }) as any;
        console.log(`   ✅ Created Hook: ${newHook.hookId} (${newHook.url})`);

        // 3. Add a Destination
        console.log("\n3️⃣  Adding Destination...");
        const destination = await client.createDestination(newHook.hookId, {
            type: 'http',
            config: {
                url: 'https://httpbin.org/post',
                method: 'POST'
            },
            name: 'HttpBin Test'
        }) as any;
        console.log(`   ✅ Added Destination: ${destination.destinationId}`);

        // 4. List Destinations
        console.log("\n4️⃣  Listing Destinations...");
        const destinations = await client.listDestinations(newHook.hookId) as any;
        console.log(`   ✅ Found ${destinations.destinations.length} destinations.`);

        // 5. Create Transformation (JSONata)
        console.log("\n5️⃣  Creating Transformation...");
        const transformation = await client.createTransformation(newHook.hookId, {
            name: 'Simple Pass-through',
            code: '$'
        }) as any;
        console.log(`   ✅ Created Transformation: ${transformation.transformationId}`);

        // 6. Get Metrics (Empty but checks endpoint)
        console.log("\n6️⃣  Fetching Metrics...");
        await client.getHookMetrics(newHook.hookId);
        console.log(`   ✅ Metrics fetched successfully.`);

        // 7. Clean up
        console.log("\n7️⃣  Cleaning up (Deleting Hook)...");
        await (client as any).request('DELETE', `/hooks/${newHook.hookId}`); // Using raw request as deleteHook might not be strictly exposed in top-level tool yet or I missed it in ZhookClient
        console.log(`   ✅ Hook deleted.`);

        console.log("\n🎉 Dry Run Completed Successfully!");

    } catch (error: any) {
        console.error("\n❌ Test Failed:", error.message);
        if (error.response) {
            console.error("   API Response:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();
