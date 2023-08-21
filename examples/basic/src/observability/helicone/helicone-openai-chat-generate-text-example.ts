import dotenv from "dotenv";
import { OpenAIChatMessage, OpenAIChatModel, generateText } from "modelfusion";

dotenv.config();

const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

if (HELICONE_API_KEY == null) {
  throw new Error("Please set the HELICONE_API_KEY environment variable");
}

(async () => {
  const text = await generateText(
    new OpenAIChatModel({
      baseUrl: "https://oai.hconeai.com/v1",
      headers: {
        "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
      },
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    [
      OpenAIChatMessage.system(
        "Write a short story about a robot learning to love:"
      ),
    ]
  );

  console.log(text);
})();
