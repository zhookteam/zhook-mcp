# @zhook/mcp-server

The official Model Context Protocol (MCP) server for [Zhook](https://zhook.dev), enabling AI agents to interact with your Zhook webhooks, events, and metrics.

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

- `zhook_list_hooks`: List all available hooks in your account.
- `zhook_get_events`: Get recent events for a hook.
- `zhook_wait_for_event`: Wait for a specific event trigger.

## License

ISC
