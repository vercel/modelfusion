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
  const toolCall = await generateToolCall(
    openai.ChatTextGenerator({
      model: "gpt-3.5-turbo",
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

  console.log(JSON.stringify(toolCall, null, 2));
}

main().catch(console.error);
