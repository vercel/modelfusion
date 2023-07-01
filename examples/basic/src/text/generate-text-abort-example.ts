import { AbortError, OpenAITextGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxTokens: 500,
  });

  const abortController = new AbortController();

  model
    .generateText("Write a short story about a robot learning to love:\n\n", {
      run: { abortSignal: abortController.signal },
    })
    .then((text) => {
      console.log(text);
    })
    .catch((error) => {
      if (error instanceof AbortError) {
        console.log("the run was aborted");
      }
    });

  abortController.abort(); // aborts the running generate text call
})();
