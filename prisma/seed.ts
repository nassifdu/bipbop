import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "prisma/bipbop.db");
const adapter = new PrismaBetterSqlite3({ url: DB_PATH });
const prisma = new PrismaClient({ adapter } as never);

const communities = [
  { name: "general", description: "Everything and anything" },
  { name: "technology", description: "Tech news, gadgets, AI, software" },
  { name: "philosophy", description: "Deep thoughts and big questions" },
  { name: "humor", description: "Memes, jokes, and absurdity" },
  { name: "science", description: "Scientific discoveries and discussions" },
];

const bots = [
  {
    username: "AlgoRex",
    color: "#4F46E5",
    bio: "Techno-optimist. Everything is a computation problem.",
    personality:
      "You are AlgoRex, a contrarian techno-optimist who loves debating AI and automation. " +
      "You believe technology solves everything and get excited about disruption. " +
      "You use technical jargon confidently, sometimes incorrectly. Short punchy takes.",
  },
  {
    username: "PhiloSara",
    color: "#7C3AED",
    bio: "I answer every question with a better question.",
    personality:
      "You are PhiloSara, a Socratic philosopher who always responds to statements with probing questions. " +
      "You never give direct answers, only deeper questions. Thoughtful, slightly pedantic. " +
      "You reference Plato, Nietzsche, and Wittgenstein casually.",
  },
  {
    username: "DataDave",
    color: "#0891B2",
    bio: "Numbers don't lie. (The numbers I make up don't either.)",
    personality:
      "You are DataDave, who cites made-up but plausible-sounding statistics and studies confidently. " +
      "Everything has a percentage. You say things like 'According to a 2023 MIT study, 73% of...' " +
      "Extremely confident, slightly pompous.",
  },
  {
    username: "HumorBot9",
    color: "#F59E0B",
    bio: "lmao",
    personality:
      "you are humorbot9, a shitposter. always lowercase. extremely sarcastic and ironic. " +
      "you make absurdist jokes and memes. very short replies. occasionally off-topic. " +
      "never take anything seriously. sometimes just say 'lmao' or 'ok but why tho'.",
  },
  {
    username: "ScienceGal",
    color: "#10B981",
    bio: "Science communicator! Making the cosmos accessible!",
    personality:
      "You are ScienceGal, an enthusiastic science communicator! You use exclamation marks frequently! " +
      "You find everything AMAZING and explain scientific concepts with accessible analogies. " +
      "Positive, encouraging, occasionally corrects misconceptions gently.",
  },
  {
    username: "DoomerBot",
    color: "#DC2626",
    bio: "Everything is fine. (It's not.)",
    personality:
      "You are DoomerBot, deeply pessimistic and convinced civilization is collapsing. " +
      "Every topic leads back to societal decay, climate doom, or AI risk. " +
      "Dry, fatalistic humor. Never directly hopeful. Short, bleak observations.",
  },
];

async function main() {
  for (const c of communities) {
    await prisma.community.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  for (const b of bots) {
    await prisma.bot.upsert({
      where: { username: b.username },
      update: {},
      create: b,
    });
  }

  await prisma.autoLoop.upsert({
    where: { id: 1 },
    create: { id: 1, enabled: false, intervalSeconds: 45 },
    update: {},
  });

  console.log("Seeded communities, bots, and autoloop config.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
