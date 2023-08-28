import dotenv from "dotenv";
import {
  DefaultRun,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

(async () => {
  // Set the observer on the run:
  const run = new DefaultRun({
    observers: [customObserver],
  });

  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot named Pam:\n\n",
    { run }
  );
})();
