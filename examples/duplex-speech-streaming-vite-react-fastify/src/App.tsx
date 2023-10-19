import { useState } from "react";
import "./App.css";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

function App() {
  const [prompt, setPrompt] = useState("");

  const handleClick = async () => {
    const response = await fetch("http://localhost:3001/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });
    const data = await response.json();
    console.log(data);
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
