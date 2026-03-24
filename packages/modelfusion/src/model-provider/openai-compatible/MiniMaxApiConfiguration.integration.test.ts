/**
 * Integration tests for MiniMax API via OpenAI-compatible interface.
 *
 * These tests require a valid MINIMAX_API_KEY environment variable.
 * Run with: MINIMAX_API_KEY=your_key npx vitest run src/model-provider/openai-compatible/MiniMaxApiConfiguration.integration.test.ts
 */
import { describe, it, expect } from "vitest";
import { generateText } from "../../model-function/generate-text/generateText";
import { streamText } from "../../model-function/generate-text/streamText";
import { MiniMaxApiConfiguration } from "./MiniMaxApiConfiguration";
import { OpenAICompatibleChatModel } from "./OpenAICompatibleChatModel";
import { arrayFromAsync } from "../../test/arrayFromAsync";

const SKIP = !process.env.MINIMAX_API_KEY;

describe.skipIf(SKIP)("MiniMax integration", () => {
  it("should generate text with MiniMax-M2.5", async () => {
    const text = await generateText({
      model: new OpenAICompatibleChatModel({
        api: new MiniMaxApiConfiguration(),
        model: "MiniMax-M2.5",
        maxGenerationTokens: 50,
      }).withTextPrompt(),
      prompt: "Say hello in one sentence.",
    });

    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  }, 30_000);

  it("should stream text with MiniMax-M2.5", async () => {
    const stream = await streamText({
      model: new OpenAICompatibleChatModel({
        api: new MiniMaxApiConfiguration(),
        model: "MiniMax-M2.5",
        maxGenerationTokens: 50,
      }).withTextPrompt(),
      prompt: "Count from 1 to 5.",
    });

    const chunks = await arrayFromAsync(stream);
    expect(chunks.length).toBeGreaterThan(0);
    const fullText = chunks.join("");
    expect(fullText).toBeTruthy();
  }, 60_000);

  it("should generate text with MiniMax-M2.7", async () => {
    const text = await generateText({
      model: new OpenAICompatibleChatModel({
        api: new MiniMaxApiConfiguration(),
        model: "MiniMax-M2.7",
        maxGenerationTokens: 50,
      }).withTextPrompt(),
      prompt: "What is 2+2? Answer with just the number.",
    });

    expect(text).toBeTruthy();
    expect(text).toContain("4");
  }, 30_000);
});
