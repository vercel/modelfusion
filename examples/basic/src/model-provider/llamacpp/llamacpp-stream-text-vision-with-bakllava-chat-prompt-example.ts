import { llamacpp, streamText } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const catImage = fs.readFileSync(path.join("data", "comic-cat.png"), {
    encoding: "base64",
  });
  const mouseImage = fs.readFileSync(path.join("data", "comic-mouse.png"), {
    encoding: "base64",
  });

  const textStream = await streamText(
    llamacpp
      .TextGenerator({
        promptTemplate: llamacpp.prompt.BakLLaVA1,
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .withChatPrompt(),

    {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "First image:" },
            { type: "image", base64Image: catImage },
            { type: "text", text: "\n\nSecond image:" },
            { type: "image", base64Image: mouseImage },
            {
              type: "text",
              text: "\n\nWrite a story about the characters from both the first and the second image.",
            },
          ],
        },
      ],
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
