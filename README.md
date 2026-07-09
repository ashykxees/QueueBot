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

4. Start the bot:

```bash
npm start
```

The bot **registers its slash commands automatically on startup**, so they show up
in Discord without any extra step. This also means it works on hosts like Railway,
Render, or Heroku that only run `npm start`.

If `GUILD_ID` is set, commands are registered to that server and appear instantly.
Without `GUILD_ID`, they are registered globally and can take up to an hour to appear.

You can still register commands manually without starting the bot:

```bash
npm run deploy
```

## Deploying on Railway

Set `DISCORD_TOKEN`, `CLIENT_ID`, and (recommended) `GUILD_ID` as service variables
in the Railway dashboard, then deploy. Railway runs `npm start`, which logs in and
registers the slash commands automatically.

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
