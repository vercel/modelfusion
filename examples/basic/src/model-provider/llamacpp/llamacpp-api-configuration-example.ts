import { llamacpp, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    llamacpp.CompletionTextGenerator({
      // Custom API configuration:
      api: llamacpp.Api({
        baseUrl: {
          host: "localhost",
          port: "9000",
        },
      }),

      maxGenerationTokens: 256,
      temperature: 0.7,
    }),
    { text: "Write a short story about a robot learning to love:\n\n" }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
