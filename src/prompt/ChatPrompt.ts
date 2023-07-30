type SystemMessage = { system: string };
type UserMessage = { user: string };
type AiMessage = { ai: string };

// Inner messages should be alternating between a user message and an ai message.
// This is hard to achieve with TypeScript. Event solutions such as
// https://stackoverflow.com/a/69800688
// fail when the inner messages are dynamically created (which is typical for chat systems).
//
// Therefore the check that the messages are alternating is done at runtime.
type InnerMessages = (UserMessage | AiMessage)[];

export type ChatPrompt =
  | [UserMessage]
  | [UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [UserMessage, AiMessage, UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [
      UserMessage,
      AiMessage,
      UserMessage,
      AiMessage,
      ...InnerMessages,
      UserMessage,
    ]
  | [SystemMessage, UserMessage]
  | [SystemMessage, UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [SystemMessage, UserMessage, AiMessage, UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [
      SystemMessage,
      UserMessage,
      AiMessage,
      UserMessage,
      AiMessage,
      ...InnerMessages,
      UserMessage,
    ];
