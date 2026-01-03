import heapq
from typing import Optional
from dataclasses import dataclass, field


@dataclass(order=True)
class HuffmanNode:
    frequency: int
    char: Optional[str] = field(compare=False, default=None)
    left: Optional['HuffmanNode'] = field(compare=False, default=None)
    right: Optional['HuffmanNode'] = field(compare=False, default=None)

    def is_leaf(self) -> bool:
        return self.left is None and self.right is None

    def to_dict(self) -> dict:
        result = {
            'frequency': self.frequency,
            'char': self.char,
            'isLeaf': self.is_leaf()
        }
        if self.left:
            result['left'] = self.left.to_dict()
        if self.right:
            result['right'] = self.right.to_dict()
        return result

    @classmethod
    def from_dict(cls, data: dict) -> 'HuffmanNode':
        node = cls(
            frequency=data['frequency'],
            char=data.get('char')
        )
        if 'left' in data:
            node.left = cls.from_dict(data['left'])
        if 'right' in data:
            node.right = cls.from_dict(data['right'])
        return node


def build_huffman_tree(frequency_map: dict[str, int]) -> Optional[HuffmanNode]:
    if not frequency_map:
        return None

    if len(frequency_map) == 1:
        char, freq = list(frequency_map.items())[0]
        root = HuffmanNode(frequency=freq)
        root.left = HuffmanNode(frequency=freq, char=char)
        return root

    heap = []
    for char, freq in frequency_map.items():
        heapq.heappush(heap, HuffmanNode(frequency=freq, char=char))

    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)

        merged = HuffmanNode(
            frequency=left.frequency + right.frequency,
            left=left,
            right=right
        )
        heapq.heappush(heap, merged)

    return heap[0] if heap else None


def generate_codes(root: Optional[HuffmanNode], prefix: str = '', codes: dict = None) -> dict[str, str]:
    if codes is None:
        codes = {}

    if root is None:
        return codes

    if root.is_leaf() and root.char is not None:
        codes[root.char] = prefix if prefix else '0'
        return codes

    if root.left:
        generate_codes(root.left, prefix + '0', codes)
    if root.right:
        generate_codes(root.right, prefix + '1', codes)

    return codes
