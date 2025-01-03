// models/game.model.ts
export interface Game {
  id: string;
  playerOneId: string;
  playerTwoId: string;
  status: 'pending' | 'active' | 'completed';
  winner?: string;
  score?: {
    playerOne: number;
    playerTwo: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
