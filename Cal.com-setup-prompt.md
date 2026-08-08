# Cal.com MCP setup

Connect an MCP-compatible AI client to Cal.com scheduling with hosted Cal.com MCP.

**Server URL:** `https://mcp.cal.com/mcp`

Hosted MCP uses Streamable HTTP and OAuth 2.1. No Cal.com API key is needed.

## What setup does

1. Client saves Cal.com MCP server URL in its MCP configuration.
2. Client connects to `https://mcp.cal.com/mcp`.
3. Cal.com opens OAuth authorization in browser.
4. User signs in to Cal.com and grants access.
5. Client saves OAuth credentials securely and connects MCP tools.

After authorization, agent can use tools allowed by Cal.com, including booking, event-type, schedule, and availability tools. Configuration alone does not create, change, or cancel bookings.

## Claude Desktop

Open Claude Desktop MCP configuration:

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.claude.json`

Add or merge:

```json
{
  "mcpServers": {
    "calcom": {
      "url": "https://mcp.cal.com/mcp"
    }
  }
}
```

Restart Claude Desktop. Connect Cal.com when OAuth authorization opens.

## Cursor

Create or update `.cursor/mcp.json` in project root. Merge with existing server entries:

```json
{
  "mcpServers": {
    "calcom": {
      "url": "https://mcp.cal.com/mcp"
    }
  }
}
```

Reload Cursor. Complete Cal.com OAuth authorization when prompted.

## Codex

In terminal, run:

```powershell
codex mcp add calcom --url https://mcp.cal.com/mcp
```

Codex detects OAuth and prints or opens Cal.com authorization URL. Sign in, grant access, then verify:

```powershell
codex mcp get calcom
```

Expected result includes:

```text
enabled: true
transport: streamable_http
url: https://mcp.cal.com/mcp
```

## OpenCode App

Open OpenCode MCP configuration:

- Windows: `C:\Users\<YourName>\.config\opencode\opencode.json`
- macOS/Linux: `~/.config/opencode/opencode.json`

Add or merge:

```json
{
  "mcpServers": {
    "calcom": {
      "type": "remote",
      "url": "https://mcp.cal.com/mcp",
      "enabled": true,
      "timeout": 60000
    }
  }
}
```

After setting up the Cal.com MCP server for OpenCode, ask the user to:

1. Restart OpenCode to load the new Cal.com MCP server
2. Open **status panel → MCP tab** (top-right corner)
3. Find the **calcom** MCP server in the list
4. Click **Enable** — this triggers OAuth authorization
5. If not already logged into Cal.com, the browser opens Cal.com login — user logs in
6. After login, the user sees an **authenticated** screen
7. Return to OpenCode — the Cal.com MCP server now shows **Enabled**
8. Tell the agent: "Done" or "Proceed" or "Continue" or "Ready" or "Authenticated" — the agent now has access to the Cal.com API

## Verify connection

Ask connected agent:

```text
Use Cal.com MCP to show my authenticated profile only. Do not change anything.
```

Successful profile response confirms connection and OAuth authorization.

## Troubleshooting

- Preserve existing JSON keys. Merge `calcom`; do not replace other MCP servers.
- Confirm exact URL is `https://mcp.cal.com/mcp`.
- Restart or reload client after configuration changes.
- If authorization fails, reconnect MCP server and finish OAuth in browser.
- Never paste Cal.com passwords, session cookies, or OAuth tokens into configuration.

Source: https://cal.com/docs/mcp-server
