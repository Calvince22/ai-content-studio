import Groq from "groq-sdk";

let groq: Groq | undefined;

const MODEL = "llama-3.3-70b-versatile";

function getGroq() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    groq = new Groq({ apiKey });
  }

  return groq;
}

export async function generateContent(prompt: string) {
  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1200,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function* streamContent(prompt: string) {
  const stream = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1200,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content ?? "";

    if (content) {
      yield content;
    }
  }
}
