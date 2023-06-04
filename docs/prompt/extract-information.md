---
sidebar_position: 1
---

# Extracting Information

### OpenAI chat model prompt

```ts
async ({ text }: { text: string }) => [
  {
    role: "user" as const,
    content: `## TOPIC\n${topic}`,
  },
  {
    role: "system" as const,
    content: `## ROLE
You are an expert at extracting information.
You need to extract and keep all the information on the topic above topic from the text below.
Only include information that is directly relevant for the topic.`,
  },
  {
    role: "user" as const,
    content: `## TEXT\n${text}`,
  },
];
```
