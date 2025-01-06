-- Insert sample games
INSERT INTO games (title, published, is_active) VALUES
    ('Science Spectacular', '2024-11-15', 0),
    ('Pop Culture Paradise', '2024-11-30', 0),
    ('History Mysteries', '2024-12-15', 0),
    ('Thrice Trivia Night', "2024-12-31", 0);

-- Science Spectacular Rounds
INSERT INTO rounds (game_id, round_number, answer, category) VALUES
    (2, 1, 'DNA', 'Biology'),
    (2, 2, 'Carbon', 'Chemistry'),
    (2, 3, 'Mars', 'Space Exploration'),
    (2, 4, 'Volcano', 'Natural Disasters'),
    (2, 5, 'Internet', 'Technology');

-- Pop Culture Paradise Rounds
INSERT INTO rounds (game_id, round_number, answer, category) VALUES
    (3, 1, 'The Beatles', 'Music History'),
    (3, 2, 'Star Wars', 'Movie Franchises'),
    (3, 3, 'Super Mario', 'Video Games'),
    (3, 4, 'Walt Disney', 'Entertainment Icons'),
    (3, 5, 'Harry Potter', 'Modern Culture');

-- History Mysteries Rounds
INSERT INTO rounds (game_id, round_number, answer, category) VALUES
    (4, 1, 'Cleopatra', 'Ancient Rulers'),
    (4, 2, 'Leonardo da Vinci', 'Renaissance Figures'),
    (4, 3, 'World War II', 'Modern History'),
    (4, 4, 'Abraham Lincoln', 'US Presidents'),
    (4, 5, 'Great Wall of China', 'World Landmarks');

-- Science Spectacular Clues
INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (6, 1, 'This molecule contains genetic instructions for development and functioning of living things.', 'DNA', 3),
    (6, 2, 'This double helix structure was discovered by Watson and Crick in 1953.', 'DNA', 2),
    (6, 3, 'This biological molecule can self-replicate and is found in nearly every cell.', 'DNA', 1);

INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (7, 1, 'This element is the basis for all known life forms.', 'Carbon', 3),
    (7, 2, 'This element can form up to four stable covalent bonds.', 'Carbon', 2),
    (7, 3, 'This element is number 6 on the periodic table.', 'Carbon', 1);

INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (8, 1, 'This planet is often called the "Red Planet" due to its surface color.', 'Mars', 3),
    (8, 2, 'This planet has two moons named Phobos and Deimos.', 'Mars', 2),
    (8, 3, 'This is the fourth planet from the Sun in our solar system.', 'Mars', 1);

-- Pop Culture Paradise Clues
INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (11, 1, 'This band released "Hey Jude" and "Yesterday".', 'The Beatles', 3),
    (11, 2, 'This group consisted of John, Paul, George, and Ringo.', 'The Beatles', 2),
    (11, 3, 'This band first appeared on The Ed Sullivan Show in 1964.', 'The Beatles', 1);

INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (12, 1, 'This film series features Luke Skywalker and Darth Vader.', 'Star Wars', 3),
    (12, 2, 'This franchise began with "A New Hope" in 1977.', 'Star Wars', 2),
    (12, 3, 'This series introduced the famous line "May the Force be with you."', 'Star Wars', 1);

INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (13, 1, 'This video game character first appeared in Donkey Kong.', 'Super Mario', 3),
    (13, 2, 'This plumber character wears red overalls and a red cap.', 'Super Mario', 2),
    (13, 3, 'This Nintendo mascot rescues Princess Peach.', 'Super Mario', 1);

-- History Mysteries Clues
INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (16, 1, 'This Egyptian queen formed alliances with both Julius Caesar and Mark Antony.', 'Cleopatra', 3),
    (16, 2, 'This ruler was the last active pharaoh of the Ptolemaic Kingdom of Egypt.', 'Cleopatra', 2),
    (16, 3, 'This queen died by suicide via asp bite in 30 BC.', 'Cleopatra', 1);

INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (17, 1, 'This polymath painted the Mona Lisa.', 'Leonardo da Vinci', 3),
    (17, 2, 'This Italian genius designed flying machines centuries before aircraft existed.', 'Leonardo da Vinci', 2),
    (17, 3, 'This artist created The Last Supper mural in Milan.', 'Leonardo da Vinci', 1);

INSERT INTO clues (round_id, clue_number, description, answer, points) VALUES
    (18, 1, 'This conflict began with Germany''s invasion of Poland in 1939.', 'World War II', 3),
    (18, 2, 'This war ended with the surrender of Japan following atomic bombings.', 'World War II', 2),
    (18, 3, 'This global conflict involved the Allied Powers and Axis Powers.', 'World War II', 1);
