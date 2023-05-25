export const extractAndExcludeChatPrompt =
  ({ excludeKeyword }: { excludeKeyword: string }) =>
  async ({ text, topic }: { text: string; topic: string }) =>
    [
      {
        role: "user" as const,
        content: `## TOPIC\n${topic}`,
      },
      {
        role: "system" as const,
        content: `## TASK
Extract and write down information from the content below that is directly relevant for the topic above.
Only include information that is directly relevant for the topic.
Say "${excludeKeyword}" if there is no relevant information in the content.`,
      },
      {
        role: "user" as const,
        content: `## CONTENT\n${text}`,
      },
    ];

export const extractChatPrompt =
  () =>
  async ({ text, topic }: { text: string; topic: string }) =>
    [
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
