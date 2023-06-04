const { OpenAITextGenerationModel } = require("ai-utils.js");

require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const textGenerationModel = new OpenAITextGenerationModel({
    apiKey: OPENAI_API_KEY,
    model: "text-davinci-003",
    settings: { temperature: 0.7 },
  });

  const response = await textGenerationModel
    .withSettings({ maxTokens: 500 })
    .generate("Write a short story about a robot learning to love:\n\n");

  const text = await textGenerationModel.extractText(response);

  console.log(text);
})();
