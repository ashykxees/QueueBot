import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.resolve("data");
const dataPath = path.join(dataDirectory, "queue.json");

const defaultState = {
  queueMessageId: null,
  queueChannelId: process.env.QUEUE_CHANNEL_ID || null,
  entries: []
};

export async function loadState() {
  try {
    const file = await readFile(dataPath, "utf8");
    return { ...defaultState, ...JSON.parse(file) };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Could not read queue data. Starting with an empty queue.", error);
    }

    return { ...defaultState };
  }
}

export async function saveState(state) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(state, null, 2)}\n`);
}
