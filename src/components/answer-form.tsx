import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnswerFormProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export function AnswerForm({ onSubmit, disabled = false }: AnswerFormProps) {
  const [answer, setAnswer] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer..."
        disabled={disabled}
        className="flex-grow"
      />
      <Button type="submit" disabled={disabled || !answer.trim()}>
        Submit
      </Button>
    </form>
  );
}
