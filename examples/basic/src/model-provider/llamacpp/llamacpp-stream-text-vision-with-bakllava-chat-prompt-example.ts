import { llamacpp, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const catImage = fs.readFileSync(path.join("data", "comic-cat.png"));
  const mouseImage = fs.readFileSync(path.join("data", "comic-mouse.png"));

  const textStream = await streamText({
    model: llamacpp
      .CompletionTextGenerator({
        // see https://modelfusion.dev/integration/model-provider/llamacpp/using-bakllava for instructions
        promptTemplate: llamacpp.prompt.BakLLaVA1,
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .withChatPrompt(),

    prompt: {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "First image:" },
            { type: "image", image: catImage },
            { type: "text", text: "\n\nSecond image:" },
            { type: "image", image: mouseImage },
            {
              type: "text",
              text: "\n\nWrite a story about the characters from both the first and the second image.",
            },
          ],
        },
      ],
    },
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
