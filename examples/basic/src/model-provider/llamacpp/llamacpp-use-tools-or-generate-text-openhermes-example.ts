import dotenv from "dotenv";
import {
  ChatMLPromptFormat,
  llamacpp,
  useToolsOrGenerateText,
} from "modelfusion";
import { openHermesToolCallsPromptFormat } from "../../tool/prompts/open-hermes";
import { calculator } from "../../tool/tools/calculator-tool";
import { weather } from "../../tool/tools/weather-tool";

dotenv.config();

// example assumes you are running https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF with llama.cpp
async function main() {
  const { text, toolResults } = await useToolsOrGenerateText(
    llamacpp
      .TextGenerator({ temperature: 0 })
      .withTextPromptFormat(ChatMLPromptFormat.instruction())
      .asToolCallsOrTextGenerationModel(openHermesToolCallsPromptFormat),
    [calculator, weather],
    "What's fourteen times twelve?"
    // "What's the weather like in Boston?"
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
