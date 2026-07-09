import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { buildQueueEmbeds } from "./queueEmbed.js";
import { loadState, saveState } from "./store.js";
import { registerCommands } from "./registerCommands.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let state = await loadState();

const allowedRoleIds = (process.env.ALLOWED_ROLE_IDS ||
  "1496697445340545045,1496697894202380540")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function requireStaff(interaction) {
  const roles = interaction.member?.roles;
  const roleIds = Array.isArray(roles) ? roles : roles?.cache;

  if (!roleIds) {
    return false;
  }

  return allowedRoleIds.some((id) =>
    Array.isArray(roleIds) ? roleIds.includes(id) : roleIds.has(id)
  );
}

function getEntry(customerId) {
  return state.entries.find((entry) => entry.customerId === customerId);
}

async function getQueueChannel(interaction) {
  const channelId = state.queueChannelId || process.env.QUEUE_CHANNEL_ID || interaction.channelId;
  const channel = await interaction.guild.channels.fetch(channelId);

  if (!channel?.isTextBased()) {
    throw new Error("The saved queue channel is not a text channel.");
  }

  state.queueChannelId = channel.id;
  return channel;
}

async function upsertQueueMessage(interaction) {
  const channel = await getQueueChannel(interaction);
  const embeds = buildQueueEmbeds(state.entries);

  if (state.queueMessageId) {
    try {
      const message = await channel.messages.fetch(state.queueMessageId);
      await message.edit({ embeds });
      await saveState(state);
      return message;
    } catch {
      state.queueMessageId = null;
    }
  }

  const message = await channel.send({ embeds });
  state.queueMessageId = message.id;
  await saveState(state);
  return message;
}

async function replyDone(interaction, content) {
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply(content);
    return;
  }

  await interaction.reply({ content, ephemeral: true });
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  try {
    const { scope, count } = await registerCommands({
      token: process.env.DISCORD_TOKEN,
      clientId: process.env.CLIENT_ID || readyClient.user.id,
      guildId: process.env.GUILD_ID
    });
    console.log(`Registered ${count} ${scope} slash commands.`);
  } catch (error) {
    console.error("Failed to register slash commands:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    if (!requireStaff(interaction)) {
      await interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    if (interaction.commandName === "queue_panel") {
      state.queueChannelId = interaction.channelId;
      state.queueMessageId = null;
      await upsertQueueMessage(interaction);
      await replyDone(interaction, "Queue panel created in this channel.");
      return;
    }

    if (interaction.commandName === "queue_add") {
      const customer = interaction.options.getUser("customer", true);
      const commission = interaction.options.getString("commission", true);
      const status = interaction.options.getString("status") || "not_started";
      const notes = interaction.options.getString("notes") || "";
      const existingEntry = getEntry(customer.id);

      if (existingEntry) {
        existingEntry.commission = commission;
        existingEntry.status = status;
        existingEntry.notes = notes;
        existingEntry.updatedAt = new Date().toISOString();
      } else {
        state.entries.push({
          customerId: customer.id,
          commission,
          status,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      await upsertQueueMessage(interaction);
      await replyDone(interaction, `Added ${customer} to the queue as **${commission}**.`);
      return;
    }

    if (interaction.commandName === "queue_update") {
      const customer = interaction.options.getUser("customer", true);
      const status = interaction.options.getString("status", true);
      const commission = interaction.options.getString("commission");
      const notes = interaction.options.getString("notes");
      const existingEntry = getEntry(customer.id);

      if (!existingEntry) {
        await replyDone(interaction, `${customer} is not currently in the queue.`);
        return;
      }

      if (status === "completed") {
        state.entries = state.entries.filter((entry) => entry.customerId !== customer.id);
        await upsertQueueMessage(interaction);
        await replyDone(interaction, `${customer}'s commission was marked completed and removed from the queue.`);
        return;
      }

      existingEntry.status = status;
      existingEntry.updatedAt = new Date().toISOString();

      if (commission) {
        existingEntry.commission = commission;
      }

      if (notes !== null) {
        existingEntry.notes = notes;
      }

      await upsertQueueMessage(interaction);
      await replyDone(interaction, `Updated ${customer}'s queue status.`);
      return;
    }

    if (interaction.commandName === "queue_remove") {
      const customer = interaction.options.getUser("customer", true);
      const beforeCount = state.entries.length;
      state.entries = state.entries.filter((entry) => entry.customerId !== customer.id);

      if (state.entries.length === beforeCount) {
        await replyDone(interaction, `${customer} is not currently in the queue.`);
        return;
      }

      await upsertQueueMessage(interaction);
      await replyDone(interaction, `Removed ${customer} from the queue.`);
    }
  } catch (error) {
    console.error(error);
    await replyDone(interaction, "Something went wrong while updating the queue. Check the bot console for details.");
  }
});

if (!process.env.DISCORD_TOKEN) {
  throw new Error("Missing DISCORD_TOKEN in .env");
}

client.login(process.env.DISCORD_TOKEN);
