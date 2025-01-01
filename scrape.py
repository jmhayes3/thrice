import re
import sys

from playwright.sync_api import sync_playwright


def extract_answers(selection) -> list:
    answers = []
    for i in range(5):
        selector = f'[data-dropdown-index-param="{i}"]'
        extracted = [element.inner_text().strip() for element in selection.query_selector_all(selector)]
        if extracted:
            answers.append(extracted[0])
    return answers


def extract_clues(selection) -> list:
    clues = []
    for i in range(5):
        selector = f'[data-dropdown-target="panel{i}"]'
        extracted = [element.inner_text().strip() for element in selection.query_selector_all(selector)]
        if extracted:
            cleaned_text = re.sub(r'[\t\n]+', '', extracted[0]).strip()
            items = cleaned_text.split("%")[0:-2]
            for item in items:
                question = item.split("?")[0].strip()
                question_str = f"{question}?"
                percent = item.split("?")[1].strip()
                clues.append(dict(question=question_str, percent_correct=percent))
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
            print(f'Navigating to {url}...')
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

            answers = extract_answers(selection)
            print("ANSWERS\n-------", answers)

            clues = extract_clues(selection)
            print("CLUES\n-------", clues)

            # assert len(answers) == 5
            # assert len(clues) == 5
            for clue in clues:
                print(clue)

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

