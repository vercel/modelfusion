import dotenv from "dotenv";
import {
  Llama2Prompt,
  modelfusion,
  ollama,
  useToolsOrGenerateText,
} from "modelfusion";
import { mistralMultiToolCallPromptTemplate } from "../../tool/prompts/mistral";
import { calculator } from "../../tool/tools/calculator-tool";
import { weather } from "../../tool/tools/weather-tool";

dotenv.config();

modelfusion.setLogFormat("detailed-object");

async function main() {
  const { text, toolResults } = await useToolsOrGenerateText(
    ollama
      .CompletionTextGenerator({
        model: "mixtral",
        temperature: 0,
        raw: true,
      })
      .withTextPromptTemplate(Llama2Prompt.instruction()) // TODO mistral
      .asToolCallsOrTextGenerationModel(mistralMultiToolCallPromptTemplate),

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