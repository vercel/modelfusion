import { llamacpp, useTools } from "modelfusion";
import { XmlTagToolCallsPromptTemplate } from "../../tool/prompts/XmlTagToolCallsPromptTemplate";
import { calculator } from "../../tool/tools/calculator-tool";
import { weather } from "../../tool/tools/weather-tool";

async function main() {
  const { text, toolResults } = await useTools({
    model: llamacpp
      .CompletionTextGenerator({
        // run https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF with llama.cpp
        promptTemplate: llamacpp.prompt.ChatML,
        temperature: 0,
      })
      .withInstructionPrompt()
      .asToolCallsOrTextGenerationModel(XmlTagToolCallsPromptTemplate.text()),

    tools: [calculator, weather],

    prompt: "What's fourteen times twelve?",
    // prompt: "What's the weather like in Boston?"
  });

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
