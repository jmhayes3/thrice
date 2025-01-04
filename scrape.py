import re
import sys

from playwright.sync_api import sync_playwright


def match_percentage_full(text):
    """Matches 1-2 digit numbers followed by a % sign."""
    pattern = r"\b\s*\d{1,2}\s*%\s*$"
    matches = re.findall(pattern, text)
    return matches

def match_percentage(text):
    """Matches 1-2 digit numbers followed by a % sign."""
    pattern = r"\b\d{1,2}%\b"
    matches = re.findall(pattern, text)
    return matches

def match_sentence_endings(text):
    """Matches any character (.) zero or more times (*) followed by . or ? or !"""
    pattern = r".*[.?!]"
    matches = re.findall(pattern, text)
    return matches

def match_sentences_advanced(text):
    """Matches sentences, with support for handling abbreviations."""
    pattern = r"(?<!\b\w\.)(?<![A-Z][a-z]\.)(?<![A-Z]\.)\b.*?[.?!]\s*\b"
    matches = re.findall(pattern, text)
    return matches

def match_one_or_two_digits(text):
    """Matches 1-2 digit numbers."""
    pattern = r"\b\d{1,2}\b"
    matches = re.findall(pattern, text)
    return matches

def extract_game_data(selection) -> dict:
    game_data = {}
    for i in range(5):
        selector = f'[data-dropdown-index-param="{i}"]'
        extracted = [element.inner_text().strip() for element in selection.query_selector_all(selector)]
        if extracted:
            answer = extracted[0]
            print(f'Round {i} answer extracted: {answer}')
            clues = extract_clues(selection, i)
            if clues:
                game_data[answer] = clues
    return game_data

def extract_clues(selection, round_number) -> list:
    clues = []
    selector = f'[data-dropdown-target="panel{round_number}"]'
    extracted = [element.inner_text().strip() for element in selection.query_selector_all(selector)]
    if extracted:
        cleaned_text = re.sub(r'[\t\n]+', '', extracted[0]).strip()
        items = cleaned_text.split("%")[0:-2]
        assert len(items) == 3
        for item in items:
            if '?' in item:
                clue = item.split("?")[0].strip()
                percent = match_percentage(item)
                clues.append(dict(clue=f"{clue}?", percent_correct=percent[-1]))
            else:
                clue = item.split(".")[0].strip()
                percent = match_percentage(item)
                clues.append(dict(clue=f"{clue}.", percent_correct=percent[-1]))
    return clues

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
        print("Launching Playwright...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        
        context.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                          'Chrome/58.0.3029.110 Safari/537.3'
        })
        print("Browser context configured with user-agent.")

        page = context.new_page()

        try:
            print(f'Navigating to {url}.')
            page.goto(url, timeout=60000)  # Timeout after 60 seconds
            print("Page loaded successfully.")

            print("Waiting for the main content to load...")
            page.wait_for_selector('#day-view', timeout=60000)  # Wait up to 60 seconds
            print("Selector #day-view found.")

            print("Extracting data...")
            selection = page.query_selector('#day-view')
            if not selection:
                print("Selection not found on the page.")
                return

            game_data = extract_game_data(selection)
            print(game_data)

            if output_file:
                print("Saving to file...")

        except Exception as e:
            print(f"An error occurred: {e}", file=sys.stderr)
        finally:
            print("Closing browser...")
            browser.close()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Scrape data from thrice.geekswhodrink.com')
    parser.add_argument('--day', type=str, required=True, help="Date in 'YYYY-MM-DD' format, e.g., '2023-12-04'")
    parser.add_argument('--output', type=str, required=False, default=None, help='Output CSV file name')

    args = parser.parse_args()

    scrape(day=args.day, output_file=args.output)
