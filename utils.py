import re
from datetime import timedelta


def match_percentages(text):
    """Match one or more digits preceded by whitespace and followed by '%'.

    Args:
        text: The text to search.

    Returns:
        A list of matching strings.

    """
    pattern = r"\s+(\d+%)"
    matches = re.findall(pattern, text)
    return matches


def match_sentences(text):
    """Match any character zero or more times followed by '.' or '!' or '?'.

    Args:
        text: The text to search.

    Returns:
        A list of matching strings.

    """
    pattern = r".*[.?!]"
    matches = re.findall(pattern, text)
    return matches


def date_range_generator(start_date, end_date):
    """Generate a sequence of dates between start_date and end_date (inclusive).

    Args:
        start_date: The starting date (datetime.date object).
        end_date: The ending date (datetime.date object).

    Yields:
        A date object for each day in the range.

    """
    current_date = start_date
    while current_date <= end_date:
        yield current_date
        current_date += timedelta(days=1)
