const { OpenAITextGenerationModel, generateText } = require("modelfusion");

require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const textGenerationModel = new OpenAITextGenerationModel({
    apiKey: OPENAI_API_KEY,
    model: "gpt-3.5-turbo-instruct",
    settings: { temperature: 0.7 },
  });

  const text = await generateText(
    textGenerationModel.withSettings({ maxCompletionTokens: 500 }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
