import dotenv from "dotenv";
import { generateToolCall, openai, zodSchema } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const { id, name, args } = await generateToolCall(
    openai.ChatTextGenerator({
      model: "gpt-4-1106-preview",
      temperature: 0,
      maxGenerationTokens: 200,
    }),
    {
      name: "getTemperature",
      description: "Get the temperature of a room.",
      parameters: zodSchema(
        z.object({
          room: z.enum(["kitchen", "bedroom", "bathroom"]),
          unit: z.enum(["Celsius", "Fahrenheit"]),
        })
      ),
    },
    [
      openai.ChatMessage.system("You are home automation system."),
      openai.ChatMessage.user(
        "Show me the temperature for kitchen in Celsius."
      ),
    ]
  );

  console.log(`Tool ID: ${id}`);
  console.log(`Tool name: ${name}`);
  console.log(`Tool arguments: ${JSON.stringify(args, null, 2)}`);
}

main().catch(console.error);
