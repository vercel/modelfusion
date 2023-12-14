import dotenv from "dotenv";
import { ChatMLPrompt, ollama, useToolsOrGenerateText } from "modelfusion";
import { calculator } from "../../tool/tools/calculator-tool";
import { openHermesToolCallsPromptTemplate } from "../../tool/prompts/open-hermes";
import { weather } from "../../tool/tools/weather-tool";

dotenv.config();

async function main() {
  const { text, toolResults } = await useToolsOrGenerateText(
    ollama
      .TextGenerator({
        model: "openhermes2.5-mistral",
        temperature: 0,
        raw: true,
      })
      .withTextPrompt()
      .withPromptTemplate(ChatMLPrompt.instruction())
      .asToolCallsOrTextGenerationModel(openHermesToolCallsPromptTemplate),

    [calculator, weather],

    // "What's fourteen times twelve?"
    "What's the weather like in Boston?"
  );

  if (text != null) {
    console.log(`TEXT: ${text}`);
  }

  for (const { tool, toolCall, args, ok, result } of toolResults ?? []) {
    console.log(`Tool call:`, toolCall);
    console.log(`Tool:`, tool);
    console.log(`Arguments:`, args);
    console.log(`Ok:`, ok);
    console.log(`Result or Error:`, result);
  }
}

main().catch(console.error);
