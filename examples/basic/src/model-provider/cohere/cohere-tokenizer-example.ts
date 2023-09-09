import { CohereTokenizer, countTokens } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const tokenizer = new CohereTokenizer({ model: "command-nightly" });

  const text = "At first, Nox didn't know what to do with the pup.";

  const tokenCount = await countTokens(tokenizer, text);
  const tokens = await tokenizer.tokenize(text);
  const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
  const reconstructedText = await tokenizer.detokenize(tokens);

  console.log("countTokens", tokenCount);
  console.log("tokenize", tokens);
  console.log("tokenizeWithTexts", tokensAndTokenTexts);
  console.log("detokenize(tokenize)", reconstructedText);
}

main().catch(console.error);
