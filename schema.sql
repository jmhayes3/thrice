DROP TABLE IF EXISTS clues;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS games;

CREATE TABLE games (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    published DATETIME NOT NULL,
    is_active INTEGER DEFAULT 0
);

CREATE TABLE rounds (
    round_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    round_number INTEGER CHECK (round_number BETWEEN 1 AND 5),
    answer TEXT NOT NULL,
    category TEXT,
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    UNIQUE (game_id, round_number)
);

CREATE TABLE clues (
    clue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER,
    clue_number INTEGER CHECK (clue_number BETWEEN 1 AND 3),
    clue_text TEXT NOT NULL,
    percent_correct INTEGER CHECK (percent_correct BETWEEN 0 AND 100),
    points INTEGER CHECK (points BETWEEN 1 AND 3),
    FOREIGN KEY (round_id) REFERENCES rounds(round_id),
    UNIQUE (round_id, clue_number)
);

CREATE INDEX idx_rounds_game_id ON rounds(game_id);
CREATE INDEX idx_clues_round_id ON clues(round_id);
