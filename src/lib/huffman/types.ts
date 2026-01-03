export interface HuffmanNode {
  frequency: number;
  char: string | null;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
}

export interface FrequencyItem {
  char: string;
  display: string;
  count: number;
  percentage: number;
  code: string;
}

export interface EncodingStatistics {
  originalSize: number;
  originalBits: number;
  encodedSize: number;
  encodedBits: number;
  compressionRatio: number;
  spaceSaved: number;
  uniqueChars: number;
  totalChars: number;
}

export interface DecodingStatistics {
  encodedSize: number;
  encodedBits: number;
  decodedSize: number;
  decodedBits: number;
  compressionRatio: number;
  totalChars: number;
}

export interface EncodingResult {
  encodedData: Uint8Array;
  statistics: EncodingStatistics;
  analysis: FrequencyItem[];
  tree: HuffmanNode | null;
  codes: Map<string, string>;
}

export interface DecodingResult {
  decodedText: string;
  statistics: DecodingStatistics;
}

export interface HistorySession {
  id: string;
  created_at: string;
  original_filename: string | null;
  original_size: number;
  encoded_size: number;
  compression_ratio: number;
  unique_chars: number | null;
  operation_type: 'encode' | 'decode';
}
