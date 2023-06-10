import { OpenAITextGenerationModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxTokens: 500,
  });

  try {
    const abortController = new AbortController();
    abortController.abort(); // this would happen in parallel to generateStory

    const text = await model.generateText(
      "Write a short story about a robot learning to love:\n\n",
      { abortSignal: abortController.signal }
    );

    console.log(text);
  } catch (error) {
    console.log(error);
  }
})();
