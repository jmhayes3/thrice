DROP TABLE IF EXISTS clues;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS games;

CREATE TABLE games (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE rounds (
    round_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    round_number INTEGER CHECK (round_number BETWEEN 1 AND 5),
    round_name TEXT,
    category TEXT,
    points_multiplier INTEGER DEFAULT 1,
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    UNIQUE (game_id, round_number)
);

CREATE TABLE clues (
    clue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER,
    clue_number INTEGER CHECK (clue_number BETWEEN 1 AND 3),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    points INTEGER DEFAULT 100,
    media_url TEXT,
    FOREIGN KEY (round_id) REFERENCES rounds(round_id),
    UNIQUE (round_id, clue_number)
);

CREATE INDEX idx_rounds_game_id ON rounds(game_id);
CREATE INDEX idx_clues_round_id ON clues(round_id);

INSERT INTO games (title) VALUES ('Sample Trivia Night');

INSERT INTO rounds (game_id, round_number, round_name, category) VALUES
    (1, 1, 'Geography', 'World Capitals'),
    (1, 2, 'Entertainment', 'Classic Movies'),
    (1, 3, 'Science', 'Famous Inventors'),
    (1, 4, 'Sports', 'Olympic History'),
    (1, 5, 'Literature', 'Shakespeare');

INSERT INTO clues (round_id, clue_number, question, answer, points) VALUES
    (1, 1, 'This European capital sits on 14 islands connected by 57 bridges.', 'Stockholm', 100),
    (1, 2, 'This city became the capital of a unified Germany in 1991.', 'Berlin', 200),
    (1, 3, 'This South American capital is the highest administrative capital in the world.', 'La Paz', 300);

INSERT INTO clues (round_id, clue_number, question, answer, points) VALUES
    (2, 1, 'This 1942 film''s famous line is "Here''s looking at you, kid."', 'Casablanca', 100),
    (2, 2, 'This 1939 film was the first to be filmed in Technicolor.', 'Gone with the Wind', 200),
    (2, 3, 'This 1941 Orson Welles film features the mysterious word "Rosebud."', 'Citizen Kane', 300);

INSERT INTO clues (round_id, clue_number, question, answer, points) VALUES
    (3, 1, 'This inventor developed the first practical light bulb.', 'Thomas Edison', 100),
    (3, 2, 'This Serbian inventor pioneered alternating current electricity.', 'Nikola Tesla', 200),
    (3, 3, 'This French scientist discovered radioactivity.', 'Marie Curie', 300);

INSERT INTO clues (round_id, clue_number, question, answer, points) VALUES
    (4, 1, 'This city has hosted the Summer Olympics three times.', 'London', 100),
    (4, 2, 'This athlete won 8 gold medals in the 2008 Beijing Olympics.', 'Michael Phelps', 200),
    (4, 3, 'This country hosted the first Winter Olympics in 1924.', 'France', 300);

INSERT INTO clues (round_id, clue_number, question, answer, points) VALUES
    (5, 1, 'This play features the famous line "To be, or not to be."', 'Hamlet', 100),
    (5, 2, 'This tragic love story is set in Verona, Italy.', 'Romeo and Juliet', 200),
    (5, 3, 'This play features three witches who predict Macbeth will become king.', 'Macbeth', 300);

CREATE VIEW game_overview AS
SELECT 
    g.game_id,
    g.title,
    r.round_number,
    r.round_name,
    r.category,
    COUNT(c.clue_id) as clue_count,
    SUM(c.points) as total_points
FROM games g
JOIN rounds r ON g.game_id = r.game_id
JOIN clues c ON r.round_id = c.round_id
GROUP BY g.game_id, g.title, r.round_number, r.round_name, r.category
ORDER BY g.game_id, r.round_number;
