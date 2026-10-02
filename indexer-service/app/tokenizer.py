import re
from typing import List
from app.config import get_settings

settings = get_settings()

# Standard list of common words that are useless to index
STOPWORDS = {
    "the", "is", "at", "which", "and", "a", "an", "in", "to", "of", 
    "it", "for", "on", "with", "as", "this", "that", "by", "from", 
    "or", "an", "be", "are", "was", "were", "ion", "that", "this",
    "you", "your", "we", "our", "they", "their", "he", "she", "his", "her"
}


def tokenize(text: str) -> List[str]:
    """
    Convert raw text into a clean list of tokens:
    1. Convert characters to lowercase.
    2. Extract words using regular expressions (Regex).
    3. Filter words based on allowed length (Min/Max length).
    4. Remove common words (Stopwords).
    """
    if not text:
        return []

    # Convert the entire text to lowercase
    text = text.lower()

    # Extract words only (ignoring punctuation, extra spaces, and simple numbers)
    words = re.findall(r'\b[a-z]{2,}\b', text)

    # Filter words based on their length and stopwords
    filtered_tokens = [
        word for word in words
        if settings.MIN_WORD_LENGTH <= len(word) <= settings.MAX_WORD_LENGTH
        and word not in STOPWORDS
    ]

    return filtered_tokens

def count_term_frequencies(tokens: List[str]) -> dict:
    """
    Calculate the term frequency of each word within the resulting list.
    """
    freqs = {}
    for token in tokens:
        freqs[token] = freqs.get(token, 0) + 1
    return freqs