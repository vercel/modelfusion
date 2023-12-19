import dotenv from "dotenv";
import { generateToolCallsOrText, openai, zodSchema } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const { text, toolCalls } = await generateToolCallsOrText(
    openai.ChatTextGenerator({
      model: "gpt-4-1106-preview",
      maxGenerationTokens: 200,
    }),
    [
      {
        name: "getTemperature" as const, // 'as const' important for type inference
        description: "Get the temperature of a room.",
        parameters: zodSchema(
          z.object({
            room: z.enum(["kitchen", "bedroom", "bathroom"]),
            unit: z.enum(["Celsius", "Fahrenheit"]),
          })
        ),
      },
      {
        name: "setTemperature" as const, // 'as const' important for type inference
        description: "Set the temperature of a room.",
        parameters: zodSchema(
          z.object({
            room: z.enum(["kitchen", "bedroom", "bathroom"]),
            temperature: z.number(),
            unit: z.enum(["Celsius", "Fahrenheit"]),
          })
        ),
      },
    ],
    [
      openai.ChatMessage.system("You are home automation system."),
      openai.ChatMessage.user("Show me the kitchen temperature"),
    ]
  );

  if (text != null) {
    console.log(`TEXT: ${text}`);
  }

  for (const toolCall of toolCalls ?? []) {
    console.log("tool call", toolCall);

    switch (toolCall.name) {
      case "getTemperature": {
        const { room, unit } = toolCall.args;
        console.log("getTemperature", room, unit);
        break;
      }

      case "setTemperature": {
        const { room, temperature, unit } = toolCall.args;
        console.log("setTemperature", room, temperature, unit);
        break;
      }
    }
  }
}

main().catch(console.error);
