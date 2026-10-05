import re
from typing import List

STOPWORDS = {
    "the", "is", "at", "which", "and", "a", "an", "in", "to", "of", 
    "it", "for", "on", "with", "as", "this", "that", "by", "from", 
    "or", "be", "are", "was", "were", "you", "your", "we", "our", 
    "they", "their", "he", "she", "his", "her"
}


def tokenize(text: str) -> List[str]:
    """Convert search query into tokens matching the indexer rules."""
    if not text:
        return []

    text = text.lower()
    words = re.findall(r'\b[a-z0-9]{2,}\b', text)
    return [w for w in words if w not in STOPWORDS]
