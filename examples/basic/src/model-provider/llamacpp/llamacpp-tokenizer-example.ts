import { LlamaCppTokenizer, countTokens } from "ai-utils.js";

(async () => {
  const tokenizer = new LlamaCppTokenizer();

  const text = "At first, Nox didn't know what to do with the pup.";

  const tokenCount = await countTokens(tokenizer, text);
  const tokens = await tokenizer.tokenize(text);

  console.log("countTokens", tokenCount);
  console.log("tokenize", tokens);
})();
