import json
import struct
from .tree import HuffmanNode


class HuffmanDecoder:
    MAGIC_BYTES = b'HUFF'

    def __init__(self):
        self.tree: HuffmanNode | None = None
        self.original_length: int = 0
        self.padding: int = 0

    def decode(self, data: bytes) -> str:
        if len(data) < 14:
            raise ValueError("Invalid Huffman file: too short")

        magic = data[:4]
        if magic != self.MAGIC_BYTES:
            raise ValueError("Invalid Huffman file: wrong magic bytes")

        version = data[4]
        if version != 1:
            raise ValueError(f"Unsupported Huffman file version: {version}")

        self.padding = data[5]
        self.original_length = struct.unpack('>I', data[6:10])[0]
        tree_length = struct.unpack('>I', data[10:14])[0]

        if self.original_length == 0:
            return ''

        tree_json = data[14:14 + tree_length].decode('utf-8')
        tree_data = json.loads(tree_json)

        if not tree_data:
            return ''

        self.tree = HuffmanNode.from_dict(tree_data)

        encoded_data = data[14 + tree_length:]
        return self._decode_bytes(encoded_data)

    def _decode_bytes(self, encoded_data: bytes) -> str:
        if not self.tree:
            return ''

        binary_string = ''.join(format(byte, '08b') for byte in encoded_data)

        if self.padding > 0:
            binary_string = binary_string[:-self.padding]

        result = []
        current_node = self.tree
        chars_decoded = 0

        for bit in binary_string:
            if chars_decoded >= self.original_length:
                break

            if bit == '0':
                current_node = current_node.left
            else:
                current_node = current_node.right

            if current_node is None:
                raise ValueError("Invalid encoded data: tree traversal failed")

            if current_node.is_leaf():
                if current_node.char is not None:
                    result.append(current_node.char)
                    chars_decoded += 1
                current_node = self.tree

        return ''.join(result)

    def get_statistics(self, encoded_data: bytes, decoded_text: str) -> dict:
        encoded_bits = len(encoded_data) * 8
        original_bits = len(decoded_text) * 8

        return {
            'encodedSize': len(encoded_data),
            'encodedBits': encoded_bits,
            'decodedSize': len(decoded_text),
            'decodedBits': original_bits,
            'compressionRatio': round(encoded_bits / original_bits * 100, 2) if original_bits > 0 else 0,
            'totalChars': len(decoded_text)
        }
