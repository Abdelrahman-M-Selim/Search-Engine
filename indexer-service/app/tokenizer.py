import re
from collections import Counter
from typing import Dict, List, Set

from app.config import get_settings

# Standard English stop words list
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
}

# Regex to match words (alphanumeric sequences)
WORD_REGEX = re.compile(r"[a-zA-Z0-9]+", re.UNICODE)


def clean_text(text: str) -> str:
    """Normalize raw text by stripping whitespace and extra characters."""
    if not text:
        return ""
    # Strip basic HTML tags if any residual tags are present
    text = re.sub(r"<[^>]+>", " ", text)
    return text.strip()


def tokenize(
    text: str,
    min_length: int = None,
    max_length: int = None,
    remove_stopwords: bool = True,
) -> List[str]:
    """
    Tokenize input text:
    1. Clean and lowercase text.
    2. Extract word tokens using regex.
    3. Filter out tokens outside length limits and stop words.
    """
    if not text:
        return []

    settings = get_settings()
    min_len = min_length if min_length is not None else settings.MIN_WORD_LENGTH
    max_len = max_length if max_length is not None else settings.MAX_WORD_LENGTH

    cleaned = clean_text(text).lower()
    raw_tokens = WORD_REGEX.findall(cleaned)

    filtered_tokens: List[str] = []
    for token in raw_tokens:
        if len(token) < min_len or len(token) > max_len:
            continue
        if remove_stopwords and token in STOP_WORDS:
            continue
        filtered_tokens.append(token)

    return filtered_tokens


def count_term_frequencies(tokens: List[str]) -> Dict[str, int]:
    """Calculate term frequencies from a list of tokens."""
    return dict(Counter(tokens))
