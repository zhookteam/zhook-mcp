# @zhook/mcp-server

The official Model Context Protocol (MCP) server for [zhook](https://zhook.dev), enabling AI agents to interact with your Zhook webhooks, events, and metrics.

## Features

- **List Hooks**: Retrieve a list of your configured webhooks.
- **Inspect Events**: View recent events for a specific hook.
- **Wait for Event**: Pause execution and wait for a specific event to occur.
- **Metrics**: Access detailed metrics about your webhook performance.

## Installation

You can run this server using `npx` or install it globally.

### Using `npx` (Recommended for Claude Desktop)

Add the following to your MCP configuration (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "zhook": {
      "command": "npx",
      "args": [
        "-y",
        "@zhook/mcp-server"
      ],
      "env": {
        "ZHOOK_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Manual Installation

```bash
npm install -g @zhook/mcp-server
```

Then run it:

```bash
zhook-mcp
```

## Configuration

The server requires a Zhook API key to authenticate requests. You can obtain this key from your Zhook dashboard.

| Environment Variable | Description | Required |
|----------------------|-------------|----------|
| `ZHOOK_API_KEY` | Your Zhook API Key | Yes |

## Tools

### Hooks
- `zhook_list_hooks`: List all webhooks configured in the Zhook account.
- `zhook_get_hook`: Get detailed configuration for a specific webhook.
- `zhook_create_hook`: Create a new webhook or MQTT hook.
- `zhook_trigger_webhook`: Send a test webhook event to a specific Hook.

### Events
- `zhook_list_events`: List recent events received by a specific hook.
- `zhook_get_event`: Get the full JSON payload and details of a specific event.
- `zhook_wait_for_event`: Connects to the Zhook WebSocket and waits for the NEXT event to arrive.

### Destinations
- `zhook_list_destinations`: List all destinations configured for a specific webhook.
- `zhook_get_destination`: Get detailed configuration for a specific destination.
- `zhook_create_destination`: Add a new destination to a hook.
- `zhook_update_destination`: Update an existing destination's configuration.
- `zhook_delete_destination`: Remove a destination from a hook.

### Transformations
- `zhook_list_transformations`: List all transformations configured for a specific webhook.
- `zhook_create_transformation`: Create a new JSONata transformation for a hook.
- `zhook_update_transformation`: Update an existing transformation.
- `zhook_delete_transformation`: Delete a transformation from a hook.

### Metrics
- `zhook_get_hook_metrics`: Get real-time metrics (request counts, success/failure rates).
- `zhook_get_aggregated_hook_metrics`: Get historical aggregated metrics with custom date ranges.

## Usage in Editors & Tools

### VSCode
1. Open the Command Palette (**Ctrl+Shift+P**).
2. Type and select **"MCP Servers"** (or configured extension command).
3. Add the server configuration as shown above.

### Antigravity (Agent)
1. Click the **"..." (More Options)** menu in the top-right toolbar.
2. Select **"MCP Servers"** and then **"Manage MCP Servers"**.
3. Add the server configuration (Name: `zhook`, Command: `npx`, Args: `-y @zhook/mcp-server`, Env: `ZHOOK_API_KEY=...`).

## License

ISC
