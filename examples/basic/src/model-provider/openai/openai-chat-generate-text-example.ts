import { OpenAIChatMessage, OpenAIChatModel, generateText } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const { text } = await generateText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 500,
    }),
    [
      OpenAIChatMessage.system(
        "Write a short story about a robot learning to love:"
      ),
    ]
  );

  console.log(text);
})();
