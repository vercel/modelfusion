import { OpenAITextGenerationModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  console.log();
  console.log("Logging: basic-text");
  console.log();

  const text1 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "basic-text" } // configure logging
  );

  console.log();
  console.log("Logging: detailed-object");
  console.log();

  const text2 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "detailed-object" } // configure logging
  );

  console.log();
  console.log("Logging: detailed-json");
  console.log();

  const text3 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "detailed-json" } // configure logging
  );
})();
