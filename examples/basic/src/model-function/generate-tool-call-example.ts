import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodSchema,
  generateToolCall,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const toolCall = await generateToolCall(
    new OpenAIChatModel({
      model: "gpt-4-1106-preview",
      temperature: 0,
      maxCompletionTokens: 200,
    }),
    {
      name: "getTemperature",
      description: "Get the temperature of a room.",
      parameters: new ZodSchema(
        z.object({
          room: z.enum(["kitchen", "bedroom", "bathroom"]),
          unit: z.enum(["Celcius", "Fahrenheit"]),
        })
      ),
    },
    [
      OpenAIChatMessage.system("You are home automation system."),
      OpenAIChatMessage.user("Show me the temperature for kitchen in Celcius."),
    ]
  );

  console.log(JSON.stringify(toolCall, null, 2));
}

main().catch(console.error);
