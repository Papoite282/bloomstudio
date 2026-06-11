import "server-only";

import OpenAI from "openai";

let openAIClient: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  openAIClient ??= new OpenAI({ apiKey });

  return openAIClient;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
}
