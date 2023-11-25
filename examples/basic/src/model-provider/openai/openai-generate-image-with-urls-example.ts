import dotenv from "dotenv";
import { OpenAIImageGenerationResponseFormat, openai } from "modelfusion";

dotenv.config();

async function main() {
  const model = openai.ImageGenerator({
    model: "dall-e-2",
    size: "512x512",
  });

  const response = await model.callAPI(
    "the wicked witch of the west in the style of early 19th century painting",
    { responseFormat: OpenAIImageGenerationResponseFormat.url }
  );

  const imageUrl = response.data[0].url;

  console.log(`Image available at ${imageUrl}`);
}

main().catch(console.error);
