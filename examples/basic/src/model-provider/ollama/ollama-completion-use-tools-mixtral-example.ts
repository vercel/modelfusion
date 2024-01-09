import { modelfusion, ollama, useTools } from "modelfusion";
import { mistralMultiToolCallPromptTemplate } from "../../tool/prompts/mistral";
import { calculator } from "../../tool/tools/calculator-tool";
import { weather } from "../../tool/tools/weather-tool";

modelfusion.setLogFormat("detailed-object");

async function main() {
  const { text, toolResults } = await useTools(
    ollama
      .CompletionTextGenerator({
        model: "mixtral",
        promptTemplate: ollama.prompt.Mistral,
        raw: true, // required when using custom prompt template
        temperature: 0,
        stopSequences: ["\n\n"], // prevent infinite generation
      })
      .withInstructionPrompt()
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
