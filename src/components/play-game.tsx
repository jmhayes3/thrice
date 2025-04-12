import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnswerForm } from "@/components/answer-form";
import { getGame, getRounds, getClues, submitAnswer } from "@/lib/api";
import type { Game, Round, Clue, AnswerResult } from "@/lib/types";

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

  // Mock data for development - would be fetched from API
  useEffect(() => {
    async function fetchGameData() {
      try {
        setLoading(true);

        // In a real implementation, fetch from API:
        // const gameData = await getGame(id!);
        // const roundsData = await getRounds(id!);
        // For each round, fetch clues:
        // for (const round of roundsData) {
        //   round.clues = await getClues(round.round_id);
        // }

        // For now, using mock data
        const mockGame: Game = {
          game_id: parseInt(id || "1"),
          title: "Trivia Challenge #1",
          published: "2025-04-01T00:00:00.000Z",
          is_active: 1,
        };

        const mockRounds: Round[] = [
          {
            round_id: 1,
            game_id: mockGame.game_id,
            round_number: 1,
            answer: "Mount Everest",
            category: "Geography",
            clues: [
              {
                clue_id: 1,
                round_id: 1,
                clue_number: 1,
                clue_text:
                  "It was first officially measured in 1856 and named after a British surveyor.",
                percent_correct: 35,
                points: 3,
              },
              {
                clue_id: 2,
                round_id: 1,
                clue_number: 2,
                clue_text:
                  "It grows about 4mm higher every year due to geologic uplift.",
                percent_correct: 60,
                points: 2,
              },
              {
                clue_id: 3,
                round_id: 1,
                clue_number: 3,
                clue_text:
                  "At 29,032 feet, it's the world's highest mountain above sea level.",
                percent_correct: 90,
                points: 1,
              },
            ],
          },
          {
            round_id: 2,
            game_id: mockGame.game_id,
            round_number: 2,
            answer: "William Shakespeare",
            category: "Literature",
            clues: [
              {
                clue_id: 4,
                round_id: 2,
                clue_number: 1,
                clue_text:
                  "Born in April 1564, this person lived during the Elizabethan era.",
                percent_correct: 30,
                points: 3,
              },
              {
                clue_id: 5,
                round_id: 2,
                clue_number: 2,
                clue_text: "They wrote 37 plays and 154 sonnets.",
                percent_correct: 65,
                points: 2,
              },
              {
                clue_id: 6,
                round_id: 2,
                clue_number: 3,
                clue_text:
                  "Famous works include Hamlet, Macbeth, and Romeo and Juliet.",
                percent_correct: 95,
                points: 1,
              },
            ],
          },
          {
            round_id: 3,
            game_id: mockGame.game_id,
            round_number: 3,
            answer: "Python",
            category: "Technology",
            clues: [
              {
                clue_id: 7,
                round_id: 3,
                clue_number: 1,
                clue_text: "Named after a British comedy group, not the snake.",
                percent_correct: 40,
                points: 3,
              },
              {
                clue_id: 8,
                round_id: 3,
                clue_number: 2,
                clue_text:
                  "Created by Guido van Rossum and first released in 1991.",
                percent_correct: 70,
                points: 2,
              },
              {
                clue_id: 9,
                round_id: 3,
                clue_number: 3,
                clue_text:
                  "A popular programming language known for its readability and simplicity.",
                percent_correct: 85,
                points: 1,
              },
            ],
          },
        ];

        setGame(mockGame);
        setRounds(mockRounds);
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
      // In a real app, this would be an API call:
      // const answerResult = await submitAnswer(
      //   currentRoundData.round_id,
      //   answer,
      //   revealedClues
      // );

      // For demo, we'll just compare the answer directly
      const isCorrect =
        answer.toLowerCase() === currentRoundData.answer.toLowerCase();
      const currentPoints = isCorrect
        ? currentRoundData.clues?.[revealedClues - 1]?.points || 0
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
