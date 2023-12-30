import { MistralInstructPrompt, generateText, llamacpp } from "modelfusion";

async function main() {
  const text = await generateText(
    llamacpp
      .TextGenerator({
        maxGenerationTokens: 512,
        temperature: 0,
        // simple list grammar:
        grammar: `root ::= ("- " item)+
item ::= [^\\n]+ "\\n"`,
      })
      .withTextPromptTemplate(MistralInstructPrompt.text()),

    "List 5 ingredients for a lasagna:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
