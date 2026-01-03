import { useCallback, useState } from 'react';
import { FolderOpen, Save, Upload, FileText, Play, Loader2, FileCode, Sparkles, Edit3, Binary, Copy, Check } from 'lucide-react';
import type { OperationMode } from '../App';

interface FileSelectionProps {
  mode: OperationMode;
  inputFile: File | null;
  outputFileName: string;
  onInputFileSelect: (file: File) => void;
  onOutputFileNameChange: (name: string) => void;
  darkMode: boolean;
  inputContent: string;
  onInputContentChange: (content: string) => void;
  onLoadSampleText: () => void;
  onProcess: () => void;
  isProcessing: boolean;
  hasEncodedDataReady: boolean;
  encodedData: Uint8Array | null;
  onLoadPreviousEncoded: () => void;
}

export function FileSelection({
  mode,
  inputFile,
  outputFileName,
  onInputFileSelect,
  onOutputFileNameChange,
  darkMode,
  inputContent,
  onInputContentChange,
  onLoadSampleText,
  onProcess,
  isProcessing,
  hasEncodedDataReady,
  encodedData,
  onLoadPreviousEncoded,
}: FileSelectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onInputFileSelect(file);
  }, [onInputFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onInputContentChange(text);
  };

  // Convert encoded data to binary string for display
  const getBinaryDisplay = () => {
    if (!encodedData) return '';
    let binary = '';
    for (let i = 0; i < Math.min(encodedData.length, 100); i++) {
      binary += encodedData[i].toString(2).padStart(8, '0') + ' ';
    }
    if (encodedData.length > 100) {
      binary += '...';
    }
    return binary.trim();
  };

  const handleCopyBinary = async () => {
    if (!encodedData) return;
    let binary = '';
    for (let i = 0; i < encodedData.length; i++) {
      binary += encodedData[i].toString(2).padStart(8, '0');
    }
    try {
      await navigator.clipboard.writeText(binary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="p-4 rounded-xl mb-4 glass-card-dark">
      <div className="flex items-center gap-2 mb-4">
        <FileText className={`w-5 h-5 ${mode === 'encode' ? 'text-emerald-400' : 'text-cyan-400'}`} />
        <h3 className="font-semibold text-white">
          {mode === 'encode' ? 'Input Text / File Selection' : 'Encoded Data Input'}
        </h3>
      </div>

      {/* Text Input Area for Encode Mode */}
      {mode === 'encode' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <label className="text-sm font-medium text-gray-300">Enter or paste text to encode:</label>
            </div>
            <span className="text-xs text-gray-500">{inputContent.length} characters</span>
          </div>
          <textarea
            value={inputContent}
            onChange={handleTextChange}
            placeholder="Type or paste your text here to encode... Or load a sample text or select a file below."
            className="w-full h-40 px-4 py-3 rounded-lg border text-sm bg-white/5 border-white/10 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all scrollbar-thin"
          />
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onLoadSampleText}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30"
            >
              <FileCode className="w-3 h-3" />
              Load Sample
            </button>
            <button
              onClick={() => onInputContentChange('')}
              disabled={isProcessing || !inputContent}
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Text
            </button>
          </div>
        </div>
      )}

      {/* Encoded Data Display for Decode Mode */}
      {mode === 'decode' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              <label className="text-sm font-medium text-gray-300">Encoded binary data to decode:</label>
            </div>
            {encodedData && (
              <span className="text-xs text-gray-500">{encodedData.length} bytes ({encodedData.length * 8} bits)</span>
            )}
          </div>
          
          {/* Encoded Data Preview */}
          <div className="w-full h-32 px-4 py-3 rounded-lg border text-sm bg-white/5 border-white/10 text-gray-200 overflow-auto scrollbar-thin">
            {encodedData ? (
              <code className="font-mono text-xs text-cyan-400 whitespace-pre-wrap break-all">
                {getBinaryDisplay()}
              </code>
            ) : (
              <span className="text-gray-500 italic">No encoded data loaded. Load previous encoded data or select a .huff file below.</span>
            )}
          </div>
          
          {/* Quick Actions for Decode Mode */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onLoadPreviousEncoded}
              disabled={isProcessing || !hasEncodedDataReady}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all border ${
                hasEncodedDataReady 
                  ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border-cyan-500/30' 
                  : 'bg-gray-500/20 text-gray-500 border-gray-500/30 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Load Previous Encoded
            </button>
            {encodedData && (
              <button
                onClick={handleCopyBinary}
                className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Binary'}
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-all duration-300
          ${isDragging
            ? mode === 'encode' 
              ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' 
              : 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
            : 'border-white/20 hover:border-white/40'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-10 h-10 mx-auto mb-2 text-purple-400" />
        <p className="text-sm text-gray-300">
          {mode === 'encode' ? 'Or drag and drop a file here' : 'Drag and drop a file here, or click Browse below'}
        </p>
        <p className="text-xs mt-1 text-gray-500">
          {mode === 'encode' ? 'Accepts: .txt, .md, .html, .css, .js, .json, .xml, .csv' : 'Accepts: .huff files only'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="w-24 text-sm font-medium text-gray-400">
            {mode === 'encode' ? 'Or File:' : 'Input File:'}
          </label>
          <input
            type="text"
            readOnly
            value={inputFile?.name || ''}
            placeholder="No file selected"
            className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white/5 border-white/10 text-gray-200 placeholder-gray-500"
          />
          <label className={`
            px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-sm font-medium transition-all
            ${mode === 'encode'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/30'
            }
          `}>
            <FolderOpen className="w-4 h-4" />
            Browse...
            <input
              type="file"
              accept={mode === 'encode' ? '.txt,.md,.html,.css,.js,.json,.xml,.csv' : '.huff'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onInputFileSelect(file);
              }}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-24 text-sm font-medium text-gray-400">Output File:</label>
          <input
            type="text"
            value={outputFileName}
            onChange={(e) => onOutputFileNameChange(e.target.value)}
            placeholder={mode === 'encode' ? 'output.huff' : 'decoded.txt'}
            className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white/5 border-white/10 text-gray-200 placeholder-gray-500"
          />
          <button className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all glass-button text-gray-300 hover:text-white">
            <Save className="w-4 h-4" />
            Save As...
          </button>
        </div>

        {/* Start Processing Button */}
        <div className="pt-2">
          <button
            onClick={onProcess}
            disabled={isProcessing || (mode === 'encode' ? !inputContent && !inputFile : !encodedData && !inputFile)}
            className={`
              w-full px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
              ${isProcessing || (mode === 'encode' ? !inputContent && !inputFile : !encodedData && !inputFile)
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98] shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
              }
              text-white
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {mode === 'encode' ? 'START ENCODING' : 'START DECODING'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}