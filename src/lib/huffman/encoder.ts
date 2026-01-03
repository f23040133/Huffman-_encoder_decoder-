import type { HuffmanNode, FrequencyItem, EncodingStatistics, EncodingResult } from './types';
import { buildHuffmanTree, generateCodes, serializeTree } from './tree';

const MAGIC_BYTES = new Uint8Array([0x48, 0x55, 0x46, 0x46]);
const VERSION = 1;

export function analyzeFrequency(text: string): Map<string, number> {
  const frequencyMap = new Map<string, number>();
  for (const char of text) {
    frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
  }
  return frequencyMap;
}

export function getCharDisplay(char: string): string {
  const specialChars: Record<string, string> = {
    ' ': 'SPACE',
    '\n': 'NEWLINE',
    '\t': 'TAB',
    '\r': 'RETURN',
    '\0': 'NULL',
  };
  return specialChars[char] || char;
}

export function formatAnalysis(
  frequencyMap: Map<string, number>,
  codes: Map<string, string>
): FrequencyItem[] {
  const total = [...frequencyMap.values()].reduce((a, b) => a + b, 0);
  const result: FrequencyItem[] = [];

  const sortedEntries = [...frequencyMap.entries()].sort((a, b) => b[1] - a[1]);

  for (const [char, count] of sortedEntries) {
    result.push({
      char,
      display: getCharDisplay(char),
      count,
      percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      code: codes.get(char) || '',
    });
  }

  return result;
}

export function encodeToBinaryString(text: string, codes: Map<string, string>): string {
  let result = '';
  for (const char of text) {
    const code = codes.get(char);
    if (code) {
      result += code;
    }
  }
  return result;
}

export function binaryStringToBytes(binaryString: string): { bytes: Uint8Array; padding: number } {
  if (!binaryString) {
    return { bytes: new Uint8Array(0), padding: 0 };
  }

  const padding = (8 - (binaryString.length % 8)) % 8;
  const paddedBinary = binaryString + '0'.repeat(padding);

  const bytes = new Uint8Array(paddedBinary.length / 8);
  for (let i = 0; i < paddedBinary.length; i += 8) {
    bytes[i / 8] = parseInt(paddedBinary.slice(i, i + 8), 2);
  }

  return { bytes, padding };
}

function createHeader(tree: HuffmanNode | null, padding: number, originalLength: number): Uint8Array {
  const treeData = serializeTree(tree);
  const treeBytes = new TextEncoder().encode(treeData);

  const header = new Uint8Array(14 + treeBytes.length);
  let offset = 0;

  header.set(MAGIC_BYTES, offset);
  offset += 4;

  header[offset++] = VERSION;
  header[offset++] = padding;

  const view = new DataView(header.buffer);
  view.setUint32(offset, originalLength, false);
  offset += 4;

  view.setUint32(offset, treeBytes.length, false);
  offset += 4;

  header.set(treeBytes, offset);

  return header;
}

export function encode(text: string): EncodingResult {
  const frequencyMap = analyzeFrequency(text);
  const tree = buildHuffmanTree(frequencyMap);
  const codes = generateCodes(tree);
  const analysis = formatAnalysis(frequencyMap, codes);

  if (!text) {
    const header = createHeader(null, 0, 0);
    return {
      encodedData: header,
      statistics: {
        originalSize: 0,
        originalBits: 0,
        encodedSize: header.length,
        encodedBits: header.length * 8,
        compressionRatio: 0,
        spaceSaved: 0,
        uniqueChars: 0,
        totalChars: 0,
      },
      analysis: [],
      tree: null,
      codes,
    };
  }

  const binaryString = encodeToBinaryString(text, codes);
  const { bytes: encodedBytes, padding } = binaryStringToBytes(binaryString);
  const header = createHeader(tree, padding, text.length);

  const result = new Uint8Array(header.length + encodedBytes.length);
  result.set(header, 0);
  result.set(encodedBytes, header.length);

  const originalBits = text.length * 8;
  const encodedBits = result.length * 8;

  const statistics: EncodingStatistics = {
    originalSize: text.length,
    originalBits,
    encodedSize: result.length,
    encodedBits,
    compressionRatio: originalBits > 0 ? Math.round((encodedBits / originalBits) * 10000) / 100 : 0,
    spaceSaved: originalBits > 0 ? Math.round((1 - encodedBits / originalBits) * 10000) / 100 : 0,
    uniqueChars: frequencyMap.size,
    totalChars: text.length,
  };

  return {
    encodedData: result,
    statistics,
    analysis,
    tree,
    codes,
  };
}
