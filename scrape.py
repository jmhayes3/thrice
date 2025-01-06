import sqlite3
from datetime import date
from playwright.sync_api import sync_playwright
from utils import match_percentages, match_sentences, date_range_generator


def insert_game_data(db_conn, day, game_data):
    """
    Inserts game data into the database.

    Parameters:
        db_conn (str): Path to the SQLite database.
        day (str): The date of the game data in 'YYYY-MM-DD' format.
        game_data (list): A list of rounds, where each round is a tuple of (answer, [(clue, percentage), ...]).

    Returns:
        None
    """
    try:
        conn = sqlite3.connect(db_conn)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rounds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id INTEGER NOT NULL,
                answer TEXT NOT NULL,
                FOREIGN KEY (game_id) REFERENCES games (id)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                round_id INTEGER NOT NULL,
                clue TEXT NOT NULL,
                percentage INTEGER NOT NULL,
                FOREIGN KEY (round_id) REFERENCES rounds (id)
            )
        """)

        cursor.execute("INSERT INTO games (date) VALUES (?)", (day,))
        game_id = cursor.lastrowid

        for answer, clues in game_data:
            cursor.execute("INSERT INTO rounds (game_id, answer) VALUES (?, ?)", (game_id, answer))
            round_id = cursor.lastrowid

            for clue, percentage in clues:
                cursor.execute("INSERT INTO clues (round_id, clue, percentage) VALUES (?, ?, ?)", (round_id, clue, percentage))

        conn.commit()
        print(f"Game data for {day} inserted successfully.")
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        conn.close()

def extract_game_data(selection):
    rounds = []
    for i in range(5):
        selector_answer = f'[data-dropdown-index-param="{i}"]'
        extracted_answers = []
        try:
            extracted_answers = [element.inner_text().strip() for element in selection.query_selector_all(selector_answer)]
        except Exception as e:
            print(f"Error extracting answers for selector {selector_answer}: {e}")

        if extracted_answers:
            answer = extracted_answers[0]
            selector_clues = f'[data-dropdown-target="panel{i}"]'
            extracted_clues = []
            try:
                extracted_clues = [element.inner_text().strip() for element in selection.query_selector_all(selector_clues)]
            except Exception as e:
                print(f"Error extracting clues for selector {selector_clues}: {e}")

            if extracted_clues:
                clues_text = extracted_clues[0]
                clues = [c.lstrip() for c in match_sentences(clues_text)]
                percentages = [int(p.rstrip("%")) for p in match_percentages(clues_text)]
                round = (answer, tuple(zip(clues, percentages)))
                rounds.append(round)
    return rounds

def scrape(day, db_conn=None):
    """
    Scrapes data from thrice.geekswhodrink.com for a given day using Playwright.

    Parameters:
        day (str): Date in 'YYYY-MM-DD' format, e.g., '2024-11-30'
        db (str): DB connection

    Returns:
        None
    """
    url = f'https://thrice.geekswhodrink.com/stats?day={day}'
    print(f"Scraping {url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        context.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                          'Chrome/58.0.3029.110 Safari/537.3'
        })
        page = context.new_page()
        try:
            page.goto(url, timeout=60000)
            page.wait_for_selector('#day-view', timeout=60000)

            selection = page.query_selector('#day-view')
            if not selection:
                print("Selection #day-view not found on the page")
                return

            game_data = extract_game_data(selection)

            for i, round in enumerate(game_data, 1):
                answer, clues = round
                print(f"Round {i}: {answer}")
                for clue, correct in clues:
                    print(f"{clue} {correct}%")

            if db_conn:
                print("Inserting data into database...")
                insert_game_data(db_conn, day, game_data)

        except Exception as e:
            import traceback
            print(f"An error occurred: {e}\n{traceback.format_exc()}")
        finally:
            browser.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Scrape data from thrice.geekswhodrink.com')
    parser.add_argument('--day', type=str, required=False, help="Date in 'YYYY-MM-DD' format, e.g., '2023-12-04'")
    parser.add_argument('--start', type=str, required=False, help="Date in 'YYYY-MM-DD' format, e.g., '2023-12-04'")
    parser.add_argument('--end', type=str, required=False, help="Date in 'YYYY-MM-DD' format, e.g., '2024-01-04'")
    parser.add_argument('--db', type=str, default='thrice.db', help='SQLite database file path')
    args = parser.parse_args()

    if args.day:
        scrape(day=args.day, db_conn=args.db)
    elif args.start and args.end:
        start_date = date.fromisoformat(args.start)
        end_date = date.fromisoformat(args.end)

        if start_date > end_date:
            print("Error: start cannot be after end.")
        elif start_date == end_date:
            print("Warning: start and end are the same. Using start date.")
            scrape(day=args.start, db_conn=args.db)
        else:
            num_days = (end_date - start_date).days
            print(f"Scraping from {args.start} to {args.end} ({num_days} days).")
            for current_date in date_range_generator(start_date, end_date):
                scrape(day=str(current_date), db_conn=args.db)
    else:
        print("Error: day or start and end args required.")
