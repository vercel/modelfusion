import {
  OpenAIImageGenerationModel,
  OpenAIImageGenerationResponseFormat,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAIImageGenerationModel({
    size: "512x512",
  });

  const response = await model.callAPI(
    "the wicked witch of the west in the style of early 19th century painting",
    {
      responseFormat: OpenAIImageGenerationResponseFormat.url,
    }
  );

  const imageUrl = response.data[0].url;

  console.log(`Image available at ${imageUrl}`);
})();
