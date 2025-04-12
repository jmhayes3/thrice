import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getGames } from "@/lib/api";
import type { Game } from "@/lib/types";

interface PaginationData {
  total: number;
  limit: number;
  offset: number;
}

export function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    limit: 10,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);

        // Get games from the API
        const data = await getGames({
          limit: pagination.limit,
          offset: pagination.offset,
        });

        setGames(data.games);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [pagination.limit, pagination.offset]);

  function handleNextPage() {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit,
      });
    }
  }

  function handlePrevPage() {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit),
      });
    }
  }

  if (loading && games.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Games</h1>

      {games.length === 0 ? (
        <p className="text-gray-500">No games available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card
              key={game.game_id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{game.title}</h2>
              <p className="text-gray-500 mb-4">
                {new Date(game.published).toLocaleDateString()}
              </p>
              <div className="flex justify-between items-center">
                <Link
                  to={`/games/${game.game_id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </Link>
                <Link
                  to={`/play/${game.game_id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Play
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevPage}
            disabled={pagination.offset === 0}
            className={`px-4 py-2 rounded ${pagination.offset === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Previous
          </button>
          <div className="text-gray-600">
            Showing {pagination.offset + 1} to{" "}
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
            of {pagination.total} games
          </div>
          <button
            onClick={handleNextPage}
            disabled={pagination.offset + pagination.limit >= pagination.total}
            className={`px-4 py-2 rounded ${pagination.offset + pagination.limit >= pagination.total
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
