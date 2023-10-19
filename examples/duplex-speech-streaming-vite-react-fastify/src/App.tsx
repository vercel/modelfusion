import "./App.css";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

function App() {
  return (
    <>
      <h3 className="mb-4">Generate Voice Answer</h3>
      <Textarea className="mb-4" placeholder="Enter prompt." rows={5} />
      <Button
        onClick={() => {
          console.log("Send");
        }}
      >
        Send
      </Button>
    </>
  );
}

export default App;
