import {
  ConsoleLogger,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      temperature: 0.7,
      maxTokens: 500,
      observers: [new ConsoleLogger()],
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
