import { ZodSchema, readEventSource } from "modelfusion";
import { useState } from "react";
import "./App.css";
import { eventSchema } from "./endpoint/eventSchema";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

function App() {
  const [prompt, setPrompt] = useState("");

  const handleClick = async () => {
    const baseUrl = "http://localhost:3001";

    const response = await fetch(`${baseUrl}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const path: string = (await response.json()).path;

    readEventSource({
      url: `${baseUrl}${path}`,
      schema: new ZodSchema(eventSchema),
      onEvent(event, eventSource) {
        console.log(event);

        switch (event.type) {
          case "finish": {
            eventSource.close();
            return;
          }
        }
      },
    });
  };

  return (
    <>
      <h3 className="mb-4">Generate Voice Answer</h3>
      <Textarea
        className="mb-4"
        placeholder="Enter prompt."
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button onClick={handleClick}>Send</Button>
    </>
  );
}

export default App;
