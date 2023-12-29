import { chat } from "./VicunaPromptTemplate.js";

describe("chat prompt", () => {
  it("should format prompt with user message", () => {
    const prompt = chat().format({
      messages: [{ role: "user", content: "user message" }],
    });

    expect(prompt).toMatchSnapshot();
  });

  it("should format prompt with user-assistant-user messages", () => {
    const prompt = chat().format({
      messages: [
        { role: "user", content: "1st user message" },
        { role: "assistant", content: "assistant message" },
        { role: "user", content: "2nd user message" },
      ],
    });

    expect(prompt).toMatchSnapshot();
  });

  it("should format prompt with system message and user-assistant-user messages", () => {
    const prompt = chat().format({
      system: "you are a chatbot",
      messages: [
        { role: "user", content: "1st user message" },
        { role: "assistant", content: "assistant message" },
        { role: "user", content: "2nd user message" },
      ],
    });

    expect(prompt).toMatchSnapshot();
  });
});
