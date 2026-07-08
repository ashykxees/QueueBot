import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands.js";

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  throw new Error("Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID in .env");
}

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
  body: commands
});

console.log(`Registered ${commands.length} slash commands.`);
