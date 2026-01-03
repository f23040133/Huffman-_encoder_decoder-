import { useState } from 'react';
import { TrendingDown, TrendingUp, Binary, Copy, Check } from 'lucide-react';
import type { EncodingResult, DecodingResult } from '../lib/huffman';
import type { OperationMode } from '../App';

interface CompressionPanelProps {
  encodingResult: EncodingResult | null;
  decodingResult: DecodingResult | null;
  mode: OperationMode;
  darkMode: boolean;
}

export function CompressionPanel({ encodingResult, decodingResult, mode, darkMode }: CompressionPanelProps) {
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio >= 30) return 'text-emerald-400';
    if (ratio >= 10) return 'text-amber-400';
    return 'text-rose-400';
  };

  const stats = encodingResult?.statistics || decodingResult?.statistics;
  const spaceSaved = encodingResult?.statistics.spaceSaved || 0;
  const compressionRatio = stats?.compressionRatio || 0;

  return (
    <div className="p-4 rounded-xl glass-card-dark">
      <div className="flex items-center gap-2 mb-4">
        {spaceSaved > 0 ? (
          <TrendingDown className="w-5 h-5 text-emerald-400" />
        ) : (
          <TrendingUp className="w-5 h-5 text-rose-400" />
        )}
        <h3 className="font-semibold text-white">
          Compression Statistics
        </h3>
      </div>

      {!stats ? (
        <div className="p-8 text-center rounded-lg bg-white/5">
          <p className="text-sm text-gray-500">
            Process a file to see compression statistics
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">
              {mode === 'encode' ? 'Original Size' : 'Encoded Size'}
            </p>
            <p className="text-xl font-bold text-white">
              {formatBytes(mode === 'encode'
                ? (encodingResult?.statistics.originalSize || 0)
                : (decodingResult?.statistics.encodedSize || 0)
              )}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">
              {mode === 'encode' ? 'Compressed Size' : 'Decoded Size'}
            </p>
            <p className="text-xl font-bold text-white">
              {formatBytes(mode === 'encode'
                ? (encodingResult?.statistics.encodedSize || 0)
                : (decodingResult?.statistics.decodedSize || 0)
              )}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">Compression Ratio</p>
            <p className={`text-xl font-bold ${getCompressionColor(compressionRatio)}`}>
              {compressionRatio}%
            </p>
          </div>

          {mode === 'encode' && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400">Space Saved</p>
              <p className={`text-xl font-bold ${spaceSaved > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {spaceSaved > 0 ? '-' : '+'}{Math.abs(spaceSaved)}%
              </p>
            </div>
          )}

          {mode === 'decode' && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400">Total Characters</p>
              <p className="text-xl font-bold text-white">
                {decodingResult?.statistics.totalChars.toLocaleString() || 0}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Binary Output Display for Encode Mode */}
      {mode === 'encode' && encodingResult && (
        <BinaryOutputDisplay encodingResult={encodingResult} />
      )}

      {/* Decoded Text Display for Decode Mode */}
      {mode === 'decode' && decodingResult && (
        <DecodedTextDisplay decodingResult={decodingResult} />
      )}
    </div>
  );
}

function DecodedTextDisplay({ decodingResult }: { decodingResult: DecodingResult }) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const displayText = showFull 
    ? decodingResult.decodedText 
    : decodingResult.decodedText.slice(0, 500) + (decodingResult.decodedText.length > 500 ? '...' : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(decodingResult.decodedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-lg border border-emerald-500/20" style={{ backgroundColor: '#0f0f23' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h4 className="font-semibold text-white">Decoded Text Output</h4>
        </div>
        <div className="flex items-center gap-2">
          {decodingResult.decodedText.length > 500 && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="px-3 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
            >
              {showFull ? 'Show Less' : 'Show All'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-sm text-gray-200 overflow-x-auto max-h-60 overflow-y-auto scrollbar-thin">
        <pre className="whitespace-pre-wrap break-all font-sans">{displayText}</pre>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Total: {decodingResult.decodedText.length} characters
      </div>
    </div>
  );
}

function BinaryOutputDisplay({ encodingResult }: { encodingResult: EncodingResult }) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  // Convert encoded data to binary string for display
  const getBinaryString = () => {
    const bytes = encodingResult.encodedData;
    let binary = '';
    for (let i = 0; i < Math.min(bytes.length, showFull ? bytes.length : 50); i++) {
      binary += bytes[i].toString(2).padStart(8, '0') + ' ';
    }
    if (!showFull && bytes.length > 50) {
      binary += '...';
    }
    return binary.trim();
  };

  const getFullBinaryString = () => {
    const bytes = encodingResult.encodedData;
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += bytes[i].toString(2).padStart(8, '0');
    }
    return binary;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullBinaryString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-lg border border-purple-500/20" style={{ backgroundColor: '#0f0f23' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-cyan-400" />
          <h4 className="font-semibold text-white">Encoded Binary Output</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFull(!showFull)}
            className="px-3 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
          >
            {showFull ? 'Show Less' : 'Show All'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-emerald-400 overflow-x-auto max-h-40 overflow-y-auto">
        <code className="whitespace-pre-wrap break-all">{getBinaryString()}</code>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Total: {encodingResult.encodedData.length} bytes ({encodingResult.encodedData.length * 8} bits)
      </div>
    </div>
  );
}
