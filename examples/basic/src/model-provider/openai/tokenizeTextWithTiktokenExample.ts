import { getTiktokenTokenizerForModel } from "ai-utils.js/model-provider/openai";

(async () => {
  const tokenizer = getTiktokenTokenizerForModel({
    model: "gpt-4",
  });

  const text = "At first, Nox didn't know what to do with the pup.";

  console.log("countTokens", await tokenizer.countTokens(text));
  console.log("encode", await tokenizer.encode(text));
  console.log("encodeWithTexts", await tokenizer.encodeWithTexts(text));
  console.log(
    "decode(encode)",
    await tokenizer.decode(await tokenizer.encode(text))
  );
})();
