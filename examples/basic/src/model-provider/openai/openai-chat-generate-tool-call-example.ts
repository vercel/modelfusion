import dotenv from "dotenv";
import { generateToolCall, openai, zodSchema } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const toolCall = await generateToolCall(
    openai.ChatTextGenerator({
      model: "gpt-3.5-turbo",
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

  console.log(JSON.stringify(toolCall, null, 2));
}

main().catch(console.error);
