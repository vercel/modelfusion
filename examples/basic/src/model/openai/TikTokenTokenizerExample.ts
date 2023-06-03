import { TikTokenTokenizer } from "ai-utils.js/model/openai";

(async () => {
  const tokenizer = TikTokenTokenizer.forModel({ model: "gpt-4" });

  const text = "At first, Nox didn't know what to do with the pup.";

  console.log("countTokens", await tokenizer.countTokens(text));
  console.log("tokenize", await tokenizer.tokenize(text));
  console.log("tokenizeWithTexts", await tokenizer.tokenizeWithTexts(text));
  console.log(
    "detokenize(tokenize)",
    await tokenizer.detokenize(await tokenizer.tokenize(text))
  );
})();
