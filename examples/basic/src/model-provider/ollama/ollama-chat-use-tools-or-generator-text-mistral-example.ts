import dotenv from "dotenv";
import {
  XmlTagToolCallsOrGenerateTextPromptTemplate,
  automatic1111,
  modelfusion,
  ollama,
  useToolsOrGenerateText,
} from "modelfusion";
import { ImageGeneratorTool } from "../../tool/tools/image-generator-tool";

dotenv.config();

modelfusion.setLogFormat("detailed-object");

async function main() {
  const { text, toolResults } = await useToolsOrGenerateText(
    ollama
      .ChatTextGenerator({
        model: "mixtral",
        temperature: 0,
      })
      .withInstructionPrompt()
      .asToolCallsOrTextGenerationModel(
        XmlTagToolCallsOrGenerateTextPromptTemplate.text()
      ),

    [
      new ImageGeneratorTool({
        model: automatic1111
          .ImageGenerator({
            model: "rpg_v5",
          })
          .withTextPrompt(),
      }),
    ],

    "Create a picture of a knight fighting a dragon"
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
