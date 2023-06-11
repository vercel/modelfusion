---
sidebar_position: 1
---

# Extracting Information

### OpenAI Chat Prompt

```ts
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
];
```
