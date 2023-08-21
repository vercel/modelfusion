import {
  AbortError,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const abortController = new AbortController();

  generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n",
    {
      run: { abortSignal: abortController.signal },
    }
  )
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
