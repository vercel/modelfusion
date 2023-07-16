---
sidebar_position: 6
---

# Information Extraction

### OpenAI Chat Prompt (without functions)

This approach generates a text output and the input needs to fit into the chat prompt.

[Example](https://github.com/lgrammel/ai-utils.js/blob/main/examples/basic/src/tutorials/information-extraction-openai-chat.ts)

```ts
const extractText = generateTextAsFunction(
  new OpenAIChatModel({
    model: "gpt-4",
    temperature: 0, // remove randomness as much as possible
    maxTokens: 500,
  }),
  async ({ text, topic }: { text: string; topic: string }) => [
    OpenAIChatMessage.system(
      [
        `## ROLE`,
        `You are an expert at extracting information.`,
        `You need to extract and keep all the information on the topic from the text below.`,
        `Only include information that is directly relevant for the topic.`,
      ].join("\n")
    ),
    OpenAIChatMessage.user(`## TOPIC\n${topic}`),
    OpenAIChatMessage.user(`## TEXT\n${text}`),
  ]
);

const extractedInformation = await extractText({
  text: sanFranciscoWikipediaContent, // longer text to extract information from
  topic: "number of residents",
});
// San Francisco, officially the City and County of San Francisco, is the fourth most populous
// city in California, with 808,437 residents as of 2022. It is the second most densely populated
// large U.S. city after New York City and the fifth-most densely populated U.S. county. Among...
```
