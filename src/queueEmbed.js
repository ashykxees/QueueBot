import { EmbedBuilder } from "discord.js";

export const statusMeta = {
  not_started: {
    label: "Not started",
    dot: "🔴"
  },
  in_progress: {
    label: "In progress",
    dot: "🟡"
  },
  file_sent: {
    label: "File sent",
    dot: "🟢"
  }
};

function formatEntry(entry, index) {
  const notes = entry.notes ? `\n> ${entry.notes}` : "";
  return `**${index + 1}.** <@${entry.customerId}> — **${entry.commission}**${notes}`;
}

function trimField(value) {
  if (value.length <= 1024) {
    return value;
  }

  return `${value.slice(0, 1000)}\n...and more.`;
}

function statusSection(entries, status) {
  const matchingEntries = entries.filter((entry) => entry.status === status);

  if (matchingEntries.length === 0) {
    return "_No customers in this status._";
  }

  return trimField(matchingEntries.map(formatEntry).join("\n\n"));
}

export function buildQueueEmbeds(entries) {
  const brandName = process.env.QUEUE_BRAND_NAME || "JACKITECT";
  const bannerUrl = process.env.BANNER_IMAGE_URL;
  const thumbnailUrl = process.env.QUEUE_THUMBNAIL_URL;

  const embed = new EmbedBuilder()
    .setColor(0x3b4145)
    .setTitle("🪴 Queue")
    .setDescription(
      `Below is the current **${brandName}** commission queue, where you can view all active orders and their current progress. Each commission is assigned a status using the key below.`
    )
    .addFields(
      {
        name: "✏️ Key System",
        value: `${statusMeta.not_started.dot} ${statusMeta.not_started.label}\n${statusMeta.in_progress.dot} ${statusMeta.in_progress.label}\n${statusMeta.file_sent.dot} ${statusMeta.file_sent.label}`
      },
      {
        name: `${statusMeta.not_started.dot} ${statusMeta.not_started.label}`,
        value: statusSection(entries, "not_started")
      },
      {
        name: `${statusMeta.in_progress.dot} ${statusMeta.in_progress.label}`,
        value: statusSection(entries, "in_progress")
      },
      {
        name: `${statusMeta.file_sent.dot} ${statusMeta.file_sent.label}`,
        value: statusSection(entries, "file_sent")
      }
    )
    .setFooter({ text: "Queue updates automatically when staff use /queue_add or /queue_update." })
    .setTimestamp();

  if (thumbnailUrl) {
    embed.setThumbnail(thumbnailUrl);
  }

  if (!bannerUrl) {
    return [embed];
  }

  const bannerEmbed = new EmbedBuilder()
    .setColor(0x3b4145)
    .setImage(bannerUrl);

  return [bannerEmbed, embed];
}
