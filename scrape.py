import re
import sys

from playwright.sync_api import sync_playwright


def extract_questions(text):
    return text


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
        
        # Optional: Set a user agent
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

            # Wait for the main content to load
            print("Waiting for the main content to load...")
            page.wait_for_selector('#day-view', timeout=60000)  # Wait up to 60 seconds
            print("Selector #day-view found.")

            # Extract data.
            print("Extracting data...")
            selection = page.query_selector('#day-view')
            if not selection:
                print("Selection not found on the page.")
                return

            rounds = []

            answer1 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-index-param="0"]')]
            answer2 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-index-param="1"]')]
            answer3 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-index-param="2"]')]
            answer4 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-index-param="3"]')]
            answer5 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-index-param="4"]')]

            rounds.append(dict(answer=answer1[0]))
            rounds.append(dict(answer=answer2[0]))
            rounds.append(dict(answer=answer3[0]))
            rounds.append(dict(answer=answer4[0]))
            rounds.append(dict(answer=answer5[0]))

            round1 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-target="panel0"]')]
            round2 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-target="panel1"]')]
            round3 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-target="panel2"]')]
            round4 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-target="panel3"]')]
            round5 = [element.inner_text().strip() for element in selection.query_selector_all('[data-dropdown-target="panel4"]')]

            if round1:
                questions = []
                text = round1[0]
                cleaned_text = re.sub(r'[\t\n]+', '', text).strip()
                items = cleaned_text.split("%")[0:-2]
                for item in items:
                    question = item.split("?")[0].strip()
                    question_str = f"{question}?"
                    percent = item.split("?")[1].strip()
                    questions.append(dict(question=question_str, percent_correct=percent))

                print(questions)

            print(rounds)

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

