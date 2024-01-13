import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: openai.ChatTextGenerator({
      model: "gpt-3.5-turbo",
      api: openai.AzureApi({
        // apiKey: automatically uses process.env.AZURE_OPENAI_API_KEY,
        resourceName: "my-resource-name",
        deploymentId: "my-deployment-id",
        apiVersion: "my-api-version",
      }),
      maxGenerationTokens: 1000,
    }),

    prompt: [
      openai.ChatMessage.system("You are a story writer. Write a story about:"),
      openai.ChatMessage.user("A robot learning to love"),
    ],
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
