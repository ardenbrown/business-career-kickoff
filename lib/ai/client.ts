import OpenAI from "openai";
import { ZodSchema } from "zod";

import { env } from "@/lib/env";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

export function extractJsonObject(content: string) {
  const match = content.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("No JSON object found in model response.");
  }

  return match[0];
}

export async function generateStructuredObject<T>({
  schema,
  system,
  prompt,
}: {
  schema: ZodSchema<T>;
  system: string;
  prompt: string;
}) {
  const client = getOpenAIClient();

  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: `${system}\nReturn valid JSON only.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const output = response.output_text;
  const json = JSON.parse(extractJsonObject(output));

  return schema.parse(json);
}
