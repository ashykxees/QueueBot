import { SlashCommandBuilder } from "discord.js";

export const statusChoices = [
  { name: "Not started", value: "not_started" },
  { name: "In progress", value: "in_progress" },
  { name: "File sent", value: "file_sent" },
  { name: "Completed", value: "completed" }
];

export const commands = [
  new SlashCommandBuilder()
    .setName("queue_panel")
    .setDescription("Create or refresh the commission queue embed in this channel."),

  new SlashCommandBuilder()
    .setName("queue_add")
    .setDescription("Add a customer to the commission queue.")
    .addUserOption((option) =>
      option
        .setName("customer")
        .setDescription("The customer being added to the queue.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("commission")
        .setDescription("Short commission name, such as 'Lobby build' or 'UI pack'.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("Starting status for this commission.")
        .setRequired(false)
        .addChoices(...statusChoices.filter((choice) => choice.value !== "completed"))
    )
    .addStringOption((option) =>
      option
        .setName("notes")
        .setDescription("Optional short details, deadline, package, or extra context.")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("queue_update")
    .setDescription("Move a queued customer to a different status.")
    .addUserOption((option) =>
      option
        .setName("customer")
        .setDescription("The customer whose commission should be updated.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("The customer's new queue status.")
        .setRequired(true)
        .addChoices(...statusChoices)
    )
    .addStringOption((option) =>
      option
        .setName("commission")
        .setDescription("Optional replacement commission name.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("notes")
        .setDescription("Optional replacement notes.")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("queue_remove")
    .setDescription("Remove a customer from the commission queue.")
    .addUserOption((option) =>
      option
        .setName("customer")
        .setDescription("The customer to remove.")
        .setRequired(true)
    )
].map((command) => command.toJSON());
