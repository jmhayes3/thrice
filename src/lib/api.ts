import type { Game, Round, Clue, AnswerResult, GamePlayState, RevealClueResult } from "./types";

export async function getGames(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{
  games: Game[];
  pagination: { total: number; limit: number; offset: number };
}> {
  const params = new URLSearchParams();

  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.search) params.append("search", options.search);

  const response = await fetch(`/api/games?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status}`);
  }

  return await response.json();
}

export async function getGame(id: string | number): Promise<Game> {
  const response = await fetch(`/api/games/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Game not found");
    }
    throw new Error(`Failed to fetch game: ${response.status}`);
  }

  return await response.json();
}

export async function getRounds(gameId: string | number): Promise<Round[]> {
  const response = await fetch(`/api/games/${gameId}/rounds`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rounds: ${response.status}`);
  }

  return await response.json();
}

export async function getClues(roundId: string | number): Promise<Clue[]> {
  const response = await fetch(`/api/rounds/${roundId}/clues`);

  if (!response.ok) {
    throw new Error(`Failed to fetch clues: ${response.status}`);
  }

  return await response.json();
}

export async function submitAnswer(
  roundId: string | number,
  answer: string,
  clueNumber: number,
): Promise<AnswerResult> {
  const response = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roundId, answer, clueNumber }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit answer: ${response.status}`);
  }

  return await response.json();
}

export async function startGamePlay(
  gameId: string | number,
  userId: string,
): Promise<GamePlayState> {
  const response = await fetch(`/api/play/${gameId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start game: ${response.status}`);
  }

  return await response.json();
}

export async function getGamePlayState(
  gameId: string | number,
  userId: string,
): Promise<GamePlayState> {
  const response = await fetch(`/api/play/${gameId}?userId=${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to get game state: ${response.status}`);
  }

  return await response.json();
}

export async function revealNextClue(
  gameId: string | number,
  userId: string,
  roundId: string | number,
  clueNumber: number,
): Promise<RevealClueResult> {
  const response = await fetch(`/api/play/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      action: "reveal_clue",
      roundId,
      clueNumber,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to reveal next clue: ${response.status}`);
  }

  return await response.json();
}

export async function advanceToNextRound(
  gameId: string | number,
  userId: string,
  roundId: string | number,
): Promise<{ message: string; current_round: number }> {
  const response = await fetch(`/api/play/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      action: "next_round",
      roundId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to advance to next round: ${response.status}`);
  }

  return await response.json();
}
