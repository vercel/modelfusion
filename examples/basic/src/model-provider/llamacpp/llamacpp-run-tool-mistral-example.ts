import { jsonToolCallPrompt, llamacpp, runTool } from "modelfusion";
import { calculator } from "../../tool/tools/calculator-tool";

async function main() {
  const { tool, toolCall, args, ok, result } = await runTool({
    model: llamacpp
      .CompletionTextGenerator({
        // run https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF with llama.cpp
        promptTemplate: llamacpp.prompt.ChatML,
        temperature: 0,
      })
      .withInstructionPrompt()
      .asToolCallGenerationModel(jsonToolCallPrompt.text()),

    tool: calculator,
    prompt: "What's fourteen times twelve?",

    logging: "detailed-object",
  });

  console.log(`Tool call:`, toolCall);
  console.log(`Tool:`, tool);
  console.log(`Arguments:`, args);
  console.log(`Ok:`, ok);
  console.log(`Result or Error:`, result);
}

main().catch(console.error);
