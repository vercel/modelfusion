import { generateOpenAIEmbedding } from "ai-utils.js/model/openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const response = await generateOpenAIEmbedding({
    apiKey: OPENAI_API_KEY,
    model: "text-embedding-ada-002",
    input: "At first, Nox didn't know what to do with the pup.",
  });

  console.log(response.data[0].embedding);
})();
