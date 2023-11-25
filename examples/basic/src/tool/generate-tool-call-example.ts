import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  zodSchema,
  generateToolCall,
  openai,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const { id, name, args } = await generateToolCall(
    openai.ChatTextGenerator({
      model: "gpt-4-1106-preview",
      temperature: 0,
      maxCompletionTokens: 200,
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
      OpenAIChatMessage.system("You are home automation system."),
      OpenAIChatMessage.user("Show me the temperature for kitchen in Celsius."),
    ]
  );

  console.log(`Tool ID: ${id}`);
  console.log(`Tool name: ${name}`);
  console.log(`Tool arguments: ${JSON.stringify(args, null, 2)}`);
}

main().catch(console.error);
