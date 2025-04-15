import { useState, useEffect, FormEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitAnswer,
  startGamePlay,
  getGamePlayState,
  revealNextClue,
  advanceToNextRound,
  getGame,
} from "@/lib/api";
import type { Game, GamePlayState, GamePlayRound } from "@/lib/types";

interface AnswerFormProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

function AnswerForm({ onSubmit, disabled = false }: AnswerFormProps) {
  const [answer, setAnswer] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-2"
    >
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

export function Play() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GamePlayState | null>(null);
  const [currentRound, setCurrentRound] = useState<GamePlayRound | null>(null);
  const [revealedClues, setRevealedClues] = useState(1);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playMode, setPlayMode] = useState(false);
  // Temporary user ID - in a real app, this would come from authentication
  const userId = "user-" + Math.random().toString(36).substring(2, 9);

  useEffect(() => {
    async function fetchGameDetails() {
      if (!id) return;

      try {
        setLoading(true);

        if (playMode) {
          // Start game play session
          const gamePlayData = await startGamePlay(id);
          setGameState(gamePlayData);
          setGame({
            game_id: gamePlayData.game_id,
            title: gamePlayData.title,
            published: "",
            is_active: 1,
          });

          // Set current round data
          if (typeof gamePlayData.current_round === "object") {
            setCurrentRound(gamePlayData.current_round);
          }

          setScore(gamePlayData.score);
          setRevealedClues(gamePlayData.revealed_clues || 1);
        } else {
          // Get game details from the API
          const gameData = await getGame(id);
          setGame(gameData);
        }

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        console.error("Error fetching game:", err);
        setLoading(false);
      }
    }

    fetchGameDetails();
  }, [id, playMode]);

  // Reveal next clue timer
  useEffect(() => {
    if (
      !playMode ||
      loading ||
      !currentRound ||
      revealedClues >= 3 ||
      result === "correct" ||
      error // Don't continue if there's an error
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (id && currentRound) {
          const nextClueData = await revealNextClue(
            id,
            userId,
            currentRound.round_id,
            revealedClues,
          );

          // Update the current round with the new clue
          setCurrentRound((prev) => {
            if (!prev) return null;

            return {
              ...prev,
              clues: [...prev.clues, nextClueData.revealed_clue],
            };
          });

          setRevealedClues(nextClueData.revealed_clues);
        }
      } catch (err) {
        console.error("Error revealing next clue:", err);

        // Check if it's a 403 error
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          errorMessage.includes("FORBIDDEN") ||
          errorMessage.includes("403")
        ) {
          // Set an error to stop the timer and show a message to the user
          setError(
            "Not authorized to continue. Please try refreshing the page.",
          );
          return; // Don't increment clues on authorization errors
        }

        // Only use fallback for non-auth errors
        setRevealedClues((prev) => Math.min(prev + 1, 3));
      }
    }, 10000); // 10 seconds between clues

    return () => clearTimeout(timer);
  }, [
    loading,
    currentRound,
    revealedClues,
    result,
    id,
    userId,
    error,
    playMode,
  ]);

  async function handleSubmitAnswer(answer: string) {
    if (!answer.trim() || !currentRound) return;

    try {
      // Submit answer to the API
      const answerResult = await submitAnswer(
        currentRound.round_id,
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

  async function handleNextRound() {
    if (!id || !currentRound) return;

    try {
      await advanceToNextRound(id, userId, currentRound.round_id);

      // Fetch updated game state
      const updatedGameState = await getGamePlayState(id, userId);
      setGameState(updatedGameState);

      if (typeof updatedGameState.current_round === "object") {
        setCurrentRound(updatedGameState.current_round);
        setRevealedClues(updatedGameState.revealed_clues || 1);
        setResult(null);
      } else if (updatedGameState.status === "completed") {
        setGameCompleted(true);
      }
    } catch (err) {
      console.error("Error advancing to next round:", err);
      setGameCompleted(true);
    }
  }

  function handleStartPlaying() {
    setPlayMode(true);
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

  if (!game) {
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

  if (!playMode) {
    return (
      <div>
        <div className="mb-6">
          <Link
            to="/games"
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            ← Back to Games
          </Link>
        </div>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-4">{game.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Game Details
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Published:</span>{" "}
                {new Date(game.published).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                {game.is_active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="flex items-end justify-end">
              <Button
                onClick={handleStartPlaying}
                className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                Play This Game
              </Button>
            </div>
          </div>

          <div className="text-gray-700">
            <h3 className="text-xl font-semibold mb-3">About This Game</h3>
            <p className="mb-4">
              Each round gives you three clues to guess the answer. The earlier
              you guess correctly, the more points you earn!
            </p>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">How to Play:</h4>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                <li>Read each clue carefully</li>
                <li>Enter your answer after any clue</li>
                <li>
                  The earlier you guess correctly, the more points you earn
                </li>
                <li>Complete all 5 rounds to finish the game</li>
              </ol>
            </div>
          </div>
        </Card>
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
            onClick={async () => {
              try {
                setLoading(true);
                const newGamePlayData = await startGamePlay(id!);
                setGameState(newGamePlayData);

                if (typeof newGamePlayData.current_round === "object") {
                  setCurrentRound(newGamePlayData.current_round);
                }

                setRevealedClues(1);
                setResult(null);
                setScore(0);
                setGameCompleted(false);
                setLoading(false);
              } catch (err) {
                console.error("Error restarting game:", err);
                setError("Failed to restart game");
              }
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
            Round {currentRound?.round_number} of{" "}
            {gameState?.rounds?.length || "?"}
          </p>
        </div>
        <div className="text-lg font-semibold">
          Score: <span className="text-blue-600">{score}</span>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {currentRound?.category}
          </span>
        </div>

        <div className="space-y-6 mb-6">
          {currentRound?.clues.map((clue) => (
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
              Correct! The answer was correctly answered!
            </p>
            <p>
              You earned {currentRound?.clues[revealedClues - 1]?.points || 0}{" "}
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
            {gameState?.status !== "completed" ? "Next Round" : "Finish Game"}
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
