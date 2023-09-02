import { OpenAITextGenerationModel, streamText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const textStream = await streamText(
    new OpenAITextGenerationModel({
      model: "ft:babbage-002:p42-software-ug::7uOojvDL",
      maxCompletionTokens: 1000,
    }),
    "German cars during the holidays."
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
