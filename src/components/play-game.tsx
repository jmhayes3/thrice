import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnswerForm } from "@/components/answer-form";
import { getGame, getRounds, getClues, submitAnswer } from "@/lib/api";
import type { Game, Round } from "@/lib/types";

export function PlayGame() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameData() {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch game details
        const gameData = await getGame(id);
        setGame(gameData);

        // Fetch rounds for this game
        const roundsData = await getRounds(id);

        // For each round, fetch clues
        for (const round of roundsData) {
          round.clues = await getClues(round.round_id);
        }

        setRounds(roundsData);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        console.error("Error fetching game:", err);
        setLoading(false);
      }
    }

    fetchGameData();
  }, [id]);

  const currentRoundData = rounds[currentRound];

  // Reveal next clue timer
  useEffect(() => {
    if (
      loading ||
      !currentRoundData ||
      revealedClues >= 3 ||
      result === "correct"
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setRevealedClues((prev) => Math.min(prev + 1, 3));
    }, 10000); // 10 seconds between clues

    return () => clearTimeout(timer);
  }, [loading, currentRoundData, revealedClues, result]);

  async function handleSubmitAnswer(answer: string) {
    if (!answer.trim() || !currentRoundData) return;

    try {
      // Submit answer to the API
      const answerResult = await submitAnswer(
        currentRoundData.round_id,
        answer,
        revealedClues,
      );

      // Update state based on answer result
      const isCorrect = answerResult.correct;
      const currentPoints =
        isCorrect && answerResult.points !== undefined
          ? answerResult.points
          : 0;

      setResult(isCorrect ? "correct" : "incorrect");

      if (isCorrect) {
        setScore((prev) => prev + currentPoints);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  }

  function handleNextRound() {
    if (currentRound + 1 < rounds.length) {
      setCurrentRound((prev) => prev + 1);
      setRevealedClues(1);
      setResult(null);
    } else {
      setGameCompleted(true);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <Link to="/games" className="mt-2 text-blue-600 underline">
          Back to Games
        </Link>
      </div>
    );
  }

  if (!game || !currentRoundData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
        <p className="mb-6">
          The game you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/games"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Games
        </Link>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold mb-6">Game Complete!</h2>
        <div className="text-5xl font-bold text-blue-600 mb-8">
          {score} points
        </div>
        <p className="text-xl mb-6">Thanks for playing!</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => {
              setCurrentRound(0);
              setRevealedClues(1);
              setResult(null);
              setScore(0);
              setGameCompleted(false);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Play Again
          </Button>
          <Button onClick={() => navigate("/games")} variant="outline">
            More Games
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{game.title}</h1>
          <p className="text-gray-600">
            Round {currentRoundData.round_number} of {rounds.length}
          </p>
        </div>
        <div className="text-lg font-semibold">
          Score: <span className="text-blue-600">{score}</span>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {currentRoundData.category}
          </span>
        </div>

        <div className="space-y-6 mb-6">
          {currentRoundData.clues?.slice(0, revealedClues).map((clue) => (
            <div key={clue.clue_id} className="animate-fadeIn">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Clue {clue.clue_number}
                {clue.points > 0 && (
                  <span className="ml-2 text-green-600">
                    (+{clue.points} points)
                  </span>
                )}
              </h3>
              <p className="text-lg">{clue.clue_text}</p>
            </div>
          ))}
        </div>

        {result === "correct" ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">
              Correct! The answer is {currentRoundData.answer}.
            </p>
            <p>
              You earned {currentRoundData.clues?.[revealedClues - 1]?.points}{" "}
              points!
            </p>
          </div>
        ) : result === "incorrect" ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p>That's not correct. Try again!</p>
          </div>
        ) : null}

        {result === "correct" ? (
          <Button onClick={handleNextRound} className="w-full">
            {currentRound + 1 < rounds.length ? "Next Round" : "Finish Game"}
          </Button>
        ) : (
          <AnswerForm onSubmit={handleSubmitAnswer} disabled={true} />
        )}
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {revealedClues < 3 && result !== "correct" && (
            <p>Next clue in a few seconds...</p>
          )}
        </div>
        <Link to="/games" className="text-gray-600 hover:text-gray-800">
          Exit Game
        </Link>
      </div>
    </div>
  );
}
