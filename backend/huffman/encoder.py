import json
import struct
from typing import Tuple
from .tree import HuffmanNode, build_huffman_tree, generate_codes
from .analyzer import FrequencyAnalyzer


class HuffmanEncoder:
    MAGIC_BYTES = b'HUFF'
    VERSION = 1

    def __init__(self):
        self.tree: HuffmanNode | None = None
        self.codes: dict[str, str] = {}
        self.frequency_map: dict[str, int] = {}

    def build_from_text(self, text: str) -> None:
        self.frequency_map = FrequencyAnalyzer.analyze(text)
        self.tree = build_huffman_tree(self.frequency_map)
        self.codes = generate_codes(self.tree) if self.tree else {}

    def encode_to_binary_string(self, text: str) -> str:
        if not self.codes:
            return ''
        return ''.join(self.codes.get(char, '') for char in text)

    def binary_string_to_bytes(self, binary_string: str) -> Tuple[bytes, int]:
        if not binary_string:
            return b'', 0

        padding = (8 - len(binary_string) % 8) % 8
        padded_binary = binary_string + '0' * padding

        byte_array = bytearray()
        for i in range(0, len(padded_binary), 8):
            byte = int(padded_binary[i:i+8], 2)
            byte_array.append(byte)

        return bytes(byte_array), padding

    def encode(self, text: str) -> bytes:
        self.build_from_text(text)

        if not text:
            return self._create_empty_file()

        binary_string = self.encode_to_binary_string(text)
        encoded_bytes, padding = self.binary_string_to_bytes(binary_string)

        header = self._create_header(padding, len(text))
        return header + encoded_bytes

    def _create_header(self, padding: int, original_length: int) -> bytes:
        tree_data = self.tree.to_dict() if self.tree else {}
        tree_json = json.dumps(tree_data, ensure_ascii=False)
        tree_bytes = tree_json.encode('utf-8')

        header = bytearray()
        header.extend(self.MAGIC_BYTES)
        header.append(self.VERSION)
        header.append(padding)
        header.extend(struct.pack('>I', original_length))
        header.extend(struct.pack('>I', len(tree_bytes)))
        header.extend(tree_bytes)

        return bytes(header)

    def _create_empty_file(self) -> bytes:
        header = bytearray()
        header.extend(self.MAGIC_BYTES)
        header.append(self.VERSION)
        header.append(0)
        header.extend(struct.pack('>I', 0))
        header.extend(struct.pack('>I', 2))
        header.extend(b'{}')
        return bytes(header)

    def get_statistics(self, text: str, encoded_bytes: bytes) -> dict:
        original_bits = len(text) * 8
        encoded_bits = len(encoded_bytes) * 8

        return {
            'originalSize': len(text),
            'originalBits': original_bits,
            'encodedSize': len(encoded_bytes),
            'encodedBits': encoded_bits,
            'compressionRatio': round(encoded_bits / original_bits * 100, 2) if original_bits > 0 else 0,
            'spaceSaved': round((1 - encoded_bits / original_bits) * 100, 2) if original_bits > 0 else 0,
            'uniqueChars': len(self.frequency_map),
            'totalChars': len(text)
        }

    def get_analysis(self) -> list:
        return FrequencyAnalyzer.format_analysis(self.frequency_map, self.codes)

    def get_tree_structure(self) -> dict | None:
        return self.tree.to_dict() if self.tree else None
