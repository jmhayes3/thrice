import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getGame } from "@/lib/api";
import type { Game } from "@/lib/types";

export function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameDetails() {
      try {
        setLoading(true);

        // In a real implementation, we would use the API client:
        // const gameData = await getGame(id!);
        // setGame(gameData);

        // For now, we'll use mock data
        const mockGame: Game = {
          game_id: parseInt(id || "1"),
          title: "Trivia Challenge #1",
          published: "2025-04-01T00:00:00.000Z",
          is_active: 1
        };

        setGame(mockGame);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching game details:", err);
        setLoading(false);
      }
    }

    if (id) {
      fetchGameDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading game details...</div>
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
        <p className="mb-6">The game you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/games"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/games" className="text-blue-600 hover:underline inline-flex items-center">
          ← Back to Games
        </Link>
      </div>

      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-4">{game.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Game Details</h3>
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
            <Link
              to={`/play/${game.game_id}`}
              className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
            >
              Play This Game
            </Link>
          </div>
        </div>

        <div className="text-gray-700">
          <h3 className="text-xl font-semibold mb-3">About This Game</h3>
          <p className="mb-4">
            Each round gives you three clues to guess the answer. The earlier you guess correctly, the more points you earn!
          </p>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">How to Play:</h4>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Read each clue carefully</li>
              <li>Enter your answer after any clue</li>
              <li>The earlier you guess correctly, the more points you earn</li>
              <li>Complete all 5 rounds to finish the game</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
