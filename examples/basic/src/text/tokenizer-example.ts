import { TikTokenTokenizer } from "ai-utils.js";

(async () => {
  const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

  const tokenCount = await tokenizer.countTokens(
    "At first, Nox didn't know what to do with the pup."
  );
  const tokens = await tokenizer.tokenize(
    "At first, Nox didn't know what to do with the pup."
  );
  const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(
    "At first, Nox didn't know what to do with the pup."
  );
  const reconstructedText = await tokenizer.detokenize(tokens);

  console.log("countTokens", tokenCount);
  console.log("tokenize", tokens);
  console.log("tokenizeWithTexts", tokensAndTokenTexts);
  console.log("detokenize(tokenize)", reconstructedText);
})();
