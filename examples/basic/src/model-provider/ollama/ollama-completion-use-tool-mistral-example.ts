import dotenv from "dotenv";
import { Llama2Prompt, modelfusion, ollama, useTool } from "modelfusion";
import { jsonToolCallPrompt1 } from "../../tool/prompts/mistral";
import { calculator } from "../../tool/tools/calculator-tool";

dotenv.config();

// modelfusion.setLogFormat("detailed-object");

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    ollama
      .CompletionTextGenerator({
        model: "mistral",
        format: "json",
        temperature: 0,
        raw: true,
      })
      .withTextPromptTemplate(Llama2Prompt.instruction()) // TODO Mistral prompt template
      .asToolCallGenerationModel(jsonToolCallPrompt1.text()),

    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
