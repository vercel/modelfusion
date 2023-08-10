import { OpenAITextGenerationModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

if (HELICONE_API_KEY == null) {
  throw new Error("Please set the HELICONE_API_KEY environment variable");
}

(async () => {
  const text = await generateText(
    new OpenAITextGenerationModel({
      baseUrl: "https://oai.hconeai.com/v1",
      headers: {
        "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
      },
      model: "text-davinci-003",
      temperature: 0.7,
      maxTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
