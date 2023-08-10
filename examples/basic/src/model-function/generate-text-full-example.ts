import { OpenAITextGenerationModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const { text, response, metadata } = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
    }),
    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );

  console.log(text);
  console.log();
  console.log(JSON.stringify(response, null, 2));
  console.log();
  console.log(JSON.stringify(metadata, null, 2));
})();
