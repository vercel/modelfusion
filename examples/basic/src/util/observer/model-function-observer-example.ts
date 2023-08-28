import dotenv from "dotenv";
import { OpenAITextGenerationModel, generateText } from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

(async () => {
  // Set the observer on the model:
  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
      observers: [customObserver],
    }),
    "Write a short story about a robot name Bud:\n\n"
  );
})();
