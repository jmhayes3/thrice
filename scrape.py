from datetime import date

from playwright.sync_api import sync_playwright

from utils import (
    match_percentages,
    match_sentences,
    date_range_generator
)


def extract_game_data(selection):
    rounds = []
    for i in range(5):
        selector_answer = f'[data-dropdown-index-param="{i}"]'
        extracted_answers = [element.inner_text().strip() for element in selection.query_selector_all(selector_answer)]
        if extracted_answers:
            answer = extracted_answers[0]
            selector_clues = f'[data-dropdown-target="panel{i}"]'
            extracted_clues = [element.inner_text().strip() for element in selection.query_selector_all(selector_clues)]
            if extracted_clues:
                clues_text = extracted_clues[0]
                clues = [c.lstrip() for c in match_sentences(clues_text)]
                percentages = [int(p.rstrip("%")) for p in match_percentages(clues_text)]
                round = (answer, tuple(zip(clues, percentages)))
                rounds.append(round)
    return rounds

def scrape(day, output_file=None):
    """
    Scrapes data from thrice.geekswhodrink.com for a given day using Playwright.

    Parameters:
        day (str): Date in 'YYYY-MM-DD' format, e.g., '2024-11-30'
        output_file (str): Filename to save the scraped data (CSV format)

    Returns:
        None
    """
    print(f"Starting scrape with day={day} and output_file={output_file}")
    url = f'https://thrice.geekswhodrink.com/stats?day={day}'
    print(f"Constructed URL: {url}")

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
            print(f'Navigating to {url}')
            page.goto(url, timeout=60000)
            print("Page loaded successfully")

            print("Waiting for the main content to load...")
            page.wait_for_selector('#day-view', timeout=60000)
            print("Selector #day-view found")

            selection = page.query_selector('#day-view')
            if not selection:
                print("Selection not found on the page")
                return

            game_data = extract_game_data(selection)
            print("="*40 + " " + day + " " + "="*40)

            for i, round in enumerate(game_data, 1):
                answer, clues = round
                print(f"Round {i}: {answer}")
                for clue, correct in clues:
                    print(f"{clue} {correct}%")

            if output_file:
                print("Saving to file...")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Scrape data from thrice.geekswhodrink.com')
    parser.add_argument('--day', type=str, required=False, help="Date in 'YYYY-MM-DD' format, e.g., '2023-12-04'")
    parser.add_argument('--start', type=str, required=False, help="Date in 'YYYY-MM-DD' format, e.g., '2023-12-04'")
    parser.add_argument('--end', type=str, required=False, help="Date in 'YYYY-MM-DD' format, e.g., '2024-01-04'")
    parser.add_argument('--output', type=str, required=False, default=None, help='Output file')
    args = parser.parse_args()

    if args.day:
        print(f"Scraping {args.day}")
        scrape(day=args.day, output_file=args.output)
    elif args.start and args.end:
        start_date = date.fromisoformat(args.start)
        end_date = date.fromisoformat(args.end)

        difference_in_days = (end_date - start_date).days
        print(f"Scraping from {args.start} to {args.end} ({difference_in_days} days)")

        for current_date in date_range_generator(start_date, end_date):
            print(f"Starting scrape for {current_date}")
            scrape(day=str(current_date), output_file=args.output)
    else:
        print("Error: day or start and end args required")
