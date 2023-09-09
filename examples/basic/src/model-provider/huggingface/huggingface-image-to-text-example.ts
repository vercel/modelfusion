import { HuggingFaceImageToTextModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

const imageUrl =
  "https://upload.wikimedia.org/wikipedia/commons/d/d8/Steam_train%2C_Seahill_%281985%29_-_geograph.org.uk_-_3789663.jpg";

async function main() {
  const imageResponse = await fetch(imageUrl);
  const data = Buffer.from(await imageResponse.arrayBuffer());

  const text = await generateText(
    new HuggingFaceImageToTextModel({
      model: "nlpconnect/vit-gpt2-image-captioning",
    }),
    data
  );

  console.log(text);
}

main().catch(console.error);
