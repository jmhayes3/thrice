import sqlite3
from datetime import date, datetime
from playwright.sync_api import sync_playwright
from utils import match_percentages, match_sentences, date_range_generator


def init_db(db_path):
    """Initialize database with schema."""
    with open('schema.sql', 'r') as f:
        schema = f.read()

    conn = sqlite3.connect(db_path)
    conn.executescript(schema)
    conn.close()


def insert_game_data(db_conn, day, game_data):
    """Insert game data."""
    try:
        conn = sqlite3.connect(db_conn)
        cursor = conn.cursor()

        published = datetime.strptime(day, '%Y-%m-%d')
        cursor.execute(
            "INSERT INTO games (published) VALUES (?)",
            (published,)
        )
        game_id = cursor.lastrowid

        for round_num, (answer, clues) in enumerate(game_data, 1):
            # Category is null since it hasn't been scraped
            cursor.execute(
                "INSERT INTO rounds (game_id, round_number, answer, category) VALUES (?, ?, ?, ?)",
                (game_id, round_num, answer, None)
            )
            round_id = cursor.lastrowid

            for clue_num, (clue_text, percent_correct) in enumerate(clues, 1):
                points = 3 if clue_num == 1 else (2 if clue_num == 2 else 1)
                cursor.execute(
                    "INSERT INTO clues (round_id, clue_number, clue_text, percent_correct, points) VALUES (?, ?, ?, ?, ?)",
                    (round_id, clue_num, clue_text, percent_correct, points,)
                )

        conn.commit()
        print(f"Game data for {day} inserted successfully")
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
    finally:
        conn.close()


def extract_game_data(selection):
    """Extract game data from the page."""
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
    """Scrape data for a given day."""
    url = f'https://thrice.geekswhodrink.com/stats?day={day}'
    print(f"Scraping {url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        )
        page = context.new_page()

        try:
            page.goto(url, timeout=60000)
            page.wait_for_selector('#day-view', timeout=60000)

            selection = page.query_selector('#day-view')
            if not selection:
                print(f"No data found for {day}")
                return

            game_data = extract_game_data(selection)
            if not game_data:
                print(f"No valid game data extracted for {day}")
                return

            for i, round in enumerate(game_data, 1):
                answer, clues = round
                print(f"Round {i}: {answer}")
                for clue, correct in clues:
                    print(f"{clue} {correct}%")

            if db_conn:
                insert_game_data(db_conn, day, game_data)

        except Exception as e:
            import traceback
            print(f"Error scraping {day}: {e}\n{traceback.format_exc()}")
        finally:
            browser.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Scrape data from thrice.geekswhodrink.com')
    parser.add_argument('--day', type=str, help="Date in 'YYYY-MM-DD' format")
    parser.add_argument('--start', type=str, help="Start date in 'YYYY-MM-DD' format")
    parser.add_argument('--end', type=str, help="End date in 'YYYY-MM-DD' format")
    parser.add_argument('--db', type=str, default='thrice.db', help='SQLite database file')
    parser.add_argument('--init-db', action='store_true', help='Initialize database schema')
    args = parser.parse_args()

    if args.init_db:
        print(f"Initializing database schema in {args.db}")
        init_db(args.db)

    if args.day:
        scrape(day=args.day, db_conn=args.db)
    elif args.start and args.end:
        start_date = date.fromisoformat(args.start)
        end_date = date.fromisoformat(args.end)

        if start_date > end_date:
            print("Error: start date cannot be after end date")
            exit(1)

        num_days = (end_date - start_date).days
        print(f"Scraping {num_days + 1} days from {args.start} to {args.end}")

        for current_date in date_range_generator(start_date, end_date):
            scrape(day=str(current_date), db_conn=args.db)
    else:
        print("Error: either --day or both --start and --end are required")
