# Roblox Commission Queue Bot

A Discord bot for a Roblox commissions server. It keeps one queue embed updated when you run slash commands:

- `/queue_add` adds a customer to the active queue and refreshes the embed.
- `/queue_update` moves a customer to another status and refreshes the embed.
- Setting a customer's status to `completed` removes them from the embed.
- `/queue_remove` manually removes a customer.
- `/queue_panel` creates or refreshes the queue message in the current channel.

## Setup

1. Install Node.js 18 or newer.
2. In this folder, run:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in:

```bash
DISCORD_TOKEN=...
CLIENT_ID=...
GUILD_ID=...
```

4. Register the slash commands:

```bash
npm run deploy
```

5. Start the bot:

```bash
npm start
```

## Discord Developer Portal

Create an application and bot at <https://discord.com/developers/applications>.

Enable these bot settings:

- `SERVER MEMBERS INTENT` is not required.
- `MESSAGE CONTENT INTENT` is not required.

Invite the bot with:

- `applications.commands`
- `bot`
- Permission: `Send Messages`, `Embed Links`, `Read Message History`

## Image Style

Discord embeds can use a big top image, but it must be a public URL. Put your JACKITECT-style banner image URL in:

```bash
BANNER_IMAGE_URL=https://example.com/banner.png
```

The rest of the queue is built directly into the embed.
