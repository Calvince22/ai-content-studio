import { db } from "@/lib/db";

export async function getUserPrompts(userId: string) {
  return db.prompt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteUserPrompt(userId: string, promptId: string) {
  const prompt = await db.prompt.findFirst({
    where: {
      id: promptId,
      userId,
    },
  });

  if (!prompt) {
    throw new Error("Prompt not found");
  }

  await db.prompt.delete({
    where: { id: promptId },
  });

  return prompt;
}
