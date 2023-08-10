import { CohereTextGenerationModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const text = await generateText(
    new CohereTextGenerationModel({
      model: "command-nightly",
      temperature: 0.7,
      maxTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
