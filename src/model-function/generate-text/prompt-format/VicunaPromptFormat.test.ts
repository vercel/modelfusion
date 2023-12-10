import { chat } from "./VicunaPromptFormat.js";

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
});
