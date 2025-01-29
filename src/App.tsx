import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="text" placeholder="Answer here..." />
      <Button type="submit">Submit</Button>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Thrice</h1>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <div>
        <Button
          variant="outline"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
      </div>
      <InputWithButton />
    </>
  );
}

export default App;
