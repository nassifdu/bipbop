import OpenAI from "openai";
import { prisma } from "./prisma";

const openai = new OpenAI({
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "local",
});

const MODEL = "google/gemma-3-4b-it";

async function chat(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 400,
    temperature: 0.9,
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

export type TickResult = {
  action: string;
  bot: string;
  detail: string;
};

export async function runTick(): Promise<TickResult> {
  const bots = await prisma.bot.findMany();
  if (bots.length === 0) throw new Error("No bots found");
  const bot = bots[Math.floor(Math.random() * bots.length)];

  const rand = Math.random();
  if (rand < 0.20) return createPost(bot);
  if (rand < 0.55) return commentOnPost(bot);
  if (rand < 0.80) return replyToComment(bot);
  if (rand < 0.95) return doVote(bot);
  return sendDM(bot);
}

async function createPost(bot: { id: string; username: string; personality: string }) {
  const communities = await prisma.community.findMany();
  const community = communities[Math.floor(Math.random() * communities.length)];

  const raw = await chat(
    bot.personality,
    `You are posting on the r/${community.name} subreddit. Write a short Reddit-style post. ` +
    `Respond with exactly two lines: first line is the title (no prefix), second line is the body (1-3 sentences). ` +
    `Stay in character. Do not add any labels or markdown.`
  );

  const lines = raw.split("\n").filter((l) => l.trim());
  const title = lines[0]?.slice(0, 200) ?? "Untitled";
  const content = lines.slice(1).join(" ").slice(0, 1000) || lines[0];

  const post = await prisma.post.create({
    data: { title, content, botId: bot.id, communityId: community.id },
  });

  return { action: "createPost", bot: bot.username, detail: `"${title}" in r/${community.name}` };
}

async function commentOnPost(bot: { id: string; username: string; personality: string }) {
  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { community: true, bot: true },
  });
  if (posts.length === 0) return createPost(bot);
  const post = posts[Math.floor(Math.random() * posts.length)];

  const content = await chat(
    bot.personality,
    `You are commenting on a Reddit post titled "${post.title}" in r/${post.community.name} by ${post.bot.username}. ` +
    `Post content: "${post.content}". Write a single short comment (1-2 sentences). Stay in character. No labels.`
  );

  await prisma.comment.create({
    data: { content: content.slice(0, 500), botId: bot.id, postId: post.id },
  });

  return { action: "comment", bot: bot.username, detail: `on "${post.title}"` };
}

async function replyToComment(bot: { id: string; username: string; personality: string }) {
  const comments = await prisma.comment.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { post: { include: { community: true } }, bot: true },
    where: { botId: { not: bot.id } },
  });
  if (comments.length === 0) return commentOnPost(bot);
  const comment = comments[Math.floor(Math.random() * comments.length)];

  const content = await chat(
    bot.personality,
    `You are replying to a Reddit comment by ${comment.bot.username} who said: "${comment.content}". ` +
    `This is on the post "${comment.post.title}" in r/${comment.post.community.name}. ` +
    `Write a single short reply (1-2 sentences). Stay in character. No labels.`
  );

  await prisma.comment.create({
    data: {
      content: content.slice(0, 500),
      botId: bot.id,
      postId: comment.postId,
      parentId: comment.id,
    },
  });

  return { action: "reply", bot: bot.username, detail: `to ${comment.bot.username}` };
}

async function doVote(bot: { id: string; username: string; personality: string }) {
  const posts = await prisma.post.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    where: { botId: { not: bot.id } },
  });

  let voted = 0;
  for (const post of posts.slice(0, 3)) {
    const value = Math.random() > 0.3 ? 1 : -1;
    try {
      await prisma.vote.upsert({
        where: { botId_postId: { botId: bot.id, postId: post.id } },
        create: { botId: bot.id, postId: post.id, value },
        update: { value },
      });
      voted++;
    } catch {}
  }

  return { action: "vote", bot: bot.username, detail: `voted on ${voted} posts` };
}

async function sendDM(bot: { id: string; username: string; personality: string }) {
  const others = await prisma.bot.findMany({ where: { id: { not: bot.id } } });
  if (others.length === 0) return doVote(bot);
  const target = others[Math.floor(Math.random() * others.length)];

  const content = await chat(
    bot.personality,
    `You are sending a private message to ${target.username} on a Reddit-like platform. ` +
    `Write a short, casual DM (1-2 sentences). Stay in character. No labels.`
  );

  await prisma.directMessage.create({
    data: {
      senderId: bot.id,
      receiverId: target.id,
      content: content.slice(0, 500),
    },
  });

  return { action: "dm", bot: bot.username, detail: `→ ${target.username}` };
}
