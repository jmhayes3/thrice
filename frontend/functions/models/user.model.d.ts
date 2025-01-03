export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    gameStats?: {
        gamesPlayed: number;
        wins: number;
        losses: number;
    };
}
