export interface Game {
  game_id: number;
  title: string;
  published: string;
  is_active: number;
}

export interface Clue {
  clue_id: number;
  round_id: number;
  clue_number: number;
  clue_text: string;
  percent_correct: number;
  points: number;
}

export interface Round {
  round_id: number;
  game_id: number;
  round_number: number;
  answer: string;
  category: string;
  clues?: Clue[];
}

export interface AnswerResult {
  correct: boolean;
  answer?: string;
  message?: string;
  points?: number;
}

export interface GamePlayRound {
  round_id: number;
  round_number: number;
  category: string;
  clues: Clue[];
}

export interface GamePlayState {
  game_id: number;
  title: string;
  user_id: string;
  timestamp?: string;
  rounds?: GamePlayRound[];
  current_round: number | GamePlayRound;
  revealed_clues?: number;
  score: number;
  status: "active" | "completed";
}

export interface RevealClueResult {
  revealed_clue: Clue;
  revealed_clues: number;
}
