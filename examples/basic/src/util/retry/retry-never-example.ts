import {
  OpenAIApiConfiguration,
  OpenAITextGenerationModel,
  generateText,
  retryNever,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const api = new OpenAIApiConfiguration({
    retry: retryNever(),
  });

  const text = await generateText(
    new OpenAITextGenerationModel({
      api,
      model: "text-davinci-003",
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
