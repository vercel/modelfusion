import { generateText, openai } from "modelfusion";

export interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const text = await generateText(
      openai.CompletionTextGenerator({
        api: openai.Api({ apiKey: env.OPENAI_API_KEY }),
        model: "gpt-3.5-turbo-instruct",
        temperature: 0.7,
        maxGenerationTokens: 50,
      }),
      "Write a short story about a robot learning to love"
    );

    return new Response(text);
  },
};
