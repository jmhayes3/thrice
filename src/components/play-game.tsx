import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnswerForm } from "@/components/answer-form";
import {
  submitAnswer,
  startGamePlay,
  getGamePlayState,
  revealNextClue,
  advanceToNextRound,
} from "@/lib/api";
import type { Game, GamePlayState, GamePlayRound } from "@/lib/types";

export function PlayGame() {
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
  // Temporary user ID - in a real app, this would come from authentication
  const userId = "user-" + Math.random().toString(36).substring(2, 9);

  useEffect(() => {
    async function fetchGameData() {
      if (!id) return;

      try {
        setLoading(true);

        // Start game play session
        const gamePlayData = await startGamePlay(id, userId);
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
  }, [id, userId]);

  // Reveal next clue timer
  useEffect(() => {
    if (
      loading ||
      !currentRound ||
      revealedClues >= 3 ||
      result === "correct"
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
        // Fallback to local reveal if API call fails
        setRevealedClues((prev) => Math.min(prev + 1, 3));
      }
    }, 10000); // 10 seconds between clues

    return () => clearTimeout(timer);
  }, [loading, currentRound, revealedClues, result, id, userId]);

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

  if (!game || !currentRound) {
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
            onClick={async () => {
              try {
                setLoading(true);
                const newGamePlayData = await startGamePlay(id, userId);
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
            Round {currentRound.round_number} of{" "}
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
            {currentRound.category}
          </span>
        </div>

        <div className="space-y-6 mb-6">
          {currentRound.clues.map((clue) => (
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
              Correct! The answer is {currentRound.answer || "correct"}.
            </p>
            <p>
              You earned {currentRound.clues[revealedClues - 1]?.points || 0}{" "}
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
          <AnswerForm
            onSubmit={handleSubmitAnswer}
            disabled={result === "correct"}
          />
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
