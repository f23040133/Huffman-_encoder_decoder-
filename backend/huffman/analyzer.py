from collections import Counter
from typing import List, Tuple


class FrequencyAnalyzer:
    @staticmethod
    def analyze(text: str) -> dict[str, int]:
        if not text:
            return {}
        return dict(Counter(text))

    @staticmethod
    def get_sorted_frequencies(frequency_map: dict[str, int], by: str = 'frequency') -> List[Tuple[str, int, float]]:
        total = sum(frequency_map.values())
        if total == 0:
            return []

        items = [
            (char, count, round(count / total * 100, 2))
            for char, count in frequency_map.items()
        ]

        if by == 'frequency':
            items.sort(key=lambda x: (-x[1], x[0]))
        elif by == 'char':
            items.sort(key=lambda x: x[0])

        return items

    @staticmethod
    def get_char_display(char: str) -> str:
        special_chars = {
            ' ': 'SPACE',
            '\n': 'NEWLINE',
            '\t': 'TAB',
            '\r': 'RETURN',
            '\0': 'NULL'
        }
        return special_chars.get(char, char)

    @staticmethod
    def format_analysis(frequency_map: dict[str, int], codes: dict[str, str]) -> List[dict]:
        total = sum(frequency_map.values())
        result = []

        for char, count in sorted(frequency_map.items(), key=lambda x: -x[1]):
            result.append({
                'char': char,
                'display': FrequencyAnalyzer.get_char_display(char),
                'count': count,
                'percentage': round(count / total * 100, 2) if total > 0 else 0,
                'code': codes.get(char, '')
            })

        return result
