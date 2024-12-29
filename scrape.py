from playwright.sync_api import sync_playwright

import csv
import sys


def scrape_stats(day, output_file='stats_data.csv'):
    """
    Scrapes stats from thrice.geekswhodrink.com for a given day using Playwright.

    Parameters:
        day (str): Date in 'YYYY-MM-DD' format, e.g., '2024-11-30'
        output_file (str): Filename to save the scraped data (CSV format)

    Returns:
        None
    """
    print(f"Starting scrape_stats with day={day} and output_file={output_file}")
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

            # Extract answers. 
            headers = [header.inner_text().strip() for header in selection.query_selector_all('[data-dropdown-index-param]')]
            print("----HEADERS----")
            print(headers)

            # Extract questions.
            print("----QUESTIONS----")
            questions = [question.inner_text().strip() for question in selection.query_selector_all("//*[contains(text(), '?')]")]
            print(questions)

            # Extract table rows, skipping header row
            rows = selection.query_selector_all('div')[1:]
            print(f"Found {len(rows)} rows in the table.")

            element = page.query_selector("//*[contains(text(), 'Submit')]")
            print("----ELEMENT----")
            print(element)

            data = []
            for idx, row in enumerate(rows):
                print(f"Processing row {idx}...")
                cells = row.query_selector_all('td')
                if len(cells) != len(headers):
                    print(f"Skipping row {idx} due to mismatch in header length.")
                    continue
                row_data = {headers[i]: cells[i].inner_text().strip() for i in range(len(headers))}
                data.append(row_data)

            if not data:
                print("No data found in the table.")
                return

            # Save data to CSV
            csv_file = day + '_' + output_file
            print(f"Saving data to {csv_file}...")
            with open(csv_file, mode='w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=headers)
                writer.writeheader()
                writer.writerows(data)

            print(f"Data successfully written to {csv_file}")

        except Exception as e:
            print(f"An error occurred: {e}", file=sys.stderr)
        finally:
            print("Closing browser...")
            browser.close()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Scrape stats from thrice.geekswhodrink.com')
    parser.add_argument('--day', type=str, required=True, help="Date in 'YYYY-MM-DD' format, e.g., '2024-11-30'")
    parser.add_argument('--output', type=str, default='stats_data.csv', help='Output CSV file name')

    args = parser.parse_args()

    scrape_stats(day=args.day, output_file=args.output)

