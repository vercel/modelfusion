import { CohereTokenizer } from "ai-utils.js/model/cohere";
import dotenv from "dotenv";

dotenv.config();

const COHERE_API_KEY = process.env.COHERE_API_KEY ?? "";

(async () => {
  const tokenizer = CohereTokenizer.forModel({
    apiKey: COHERE_API_KEY,
    model: "command-nightly",
  });

  const text = "At first, Nox didn't know what to do with the pup.";

  console.log("countTokens", await tokenizer.countTokens(text));
  console.log("tokenize", await tokenizer.tokenize(text));
  console.log("tokenizeWithTexts", await tokenizer.tokenizeWithTexts(text));
  console.log(
    "detokenize(tokenize)",
    await tokenizer.detokenize(await tokenizer.tokenize(text))
  );
})();
