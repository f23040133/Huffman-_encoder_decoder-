import type { HuffmanNode, DecodingResult, DecodingStatistics } from './types';
import { deserializeTree, isLeaf } from './tree';

const MAGIC_BYTES = new Uint8Array([0x48, 0x55, 0x46, 0x46]);

export function decode(data: Uint8Array): DecodingResult {
  if (data.length < 14) {
    throw new Error('Invalid Huffman file: too short');
  }

  const magic = data.slice(0, 4);
  if (!magic.every((byte, i) => byte === MAGIC_BYTES[i])) {
    throw new Error('Invalid Huffman file: wrong magic bytes');
  }

  const version = data[4];
  if (version !== 1) {
    throw new Error(`Unsupported Huffman file version: ${version}`);
  }

  const padding = data[5];
  const view = new DataView(data.buffer, data.byteOffset);
  const originalLength = view.getUint32(6, false);
  const treeLength = view.getUint32(10, false);

  if (originalLength === 0) {
    return {
      decodedText: '',
      statistics: {
        encodedSize: data.length,
        encodedBits: data.length * 8,
        decodedSize: 0,
        decodedBits: 0,
        compressionRatio: 0,
        totalChars: 0,
      },
    };
  }

  const treeData = new TextDecoder().decode(data.slice(14, 14 + treeLength));
  const tree = deserializeTree(treeData);

  if (!tree) {
    throw new Error('Invalid Huffman file: failed to deserialize tree');
  }

  const encodedData = data.slice(14 + treeLength);
  const decodedText = decodeBytes(encodedData, tree, padding, originalLength);

  const encodedBits = data.length * 8;
  const decodedBits = decodedText.length * 8;

  const statistics: DecodingStatistics = {
    encodedSize: data.length,
    encodedBits,
    decodedSize: decodedText.length,
    decodedBits,
    compressionRatio: decodedBits > 0 ? Math.round((encodedBits / decodedBits) * 10000) / 100 : 0,
    totalChars: decodedText.length,
  };

  return { decodedText, statistics };
}

function decodeBytes(
  encodedData: Uint8Array,
  tree: HuffmanNode,
  padding: number,
  originalLength: number
): string {
  let binaryString = '';
  for (const byte of encodedData) {
    binaryString += byte.toString(2).padStart(8, '0');
  }

  if (padding > 0) {
    binaryString = binaryString.slice(0, -padding);
  }

  const result: string[] = [];
  let currentNode: HuffmanNode = tree;
  let charsDecoded = 0;

  for (const bit of binaryString) {
    if (charsDecoded >= originalLength) {
      break;
    }

    if (bit === '0') {
      currentNode = currentNode.left!;
    } else {
      currentNode = currentNode.right!;
    }

    if (!currentNode) {
      throw new Error('Invalid encoded data: tree traversal failed');
    }

    if (isLeaf(currentNode)) {
      if (currentNode.char !== null) {
        result.push(currentNode.char);
        charsDecoded++;
      }
      currentNode = tree;
    }
  }

  return result.join('');
}
