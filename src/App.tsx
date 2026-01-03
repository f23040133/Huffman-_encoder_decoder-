import { useState, useCallback, useEffect } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { FileSelection } from './components/FileSelection';
import { StatisticsPanel } from './components/StatisticsPanel';
import { CompressionPanel } from './components/CompressionPanel';
import { CodeTable } from './components/CodeTable';
import { ProgressSection } from './components/ProgressSection';
import { OperationLog } from './components/OperationLog';
import { ActionButtons } from './components/ActionButtons';
import { MenuBar } from './components/MenuBar';
import { StatusBar } from './components/StatusBar';
import { TreeModal } from './components/TreeModal';
import { encode, decode } from './lib/huffman';
import type { EncodingResult, DecodingResult, FrequencyItem, HuffmanNode } from './lib/huffman';

export type OperationMode = 'encode' | 'decode';
export type AppStatus = 'ready' | 'processing' | 'complete' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

function App() {
  const [darkMode] = useState(true);
  const [mode, setMode] = useState<OperationMode>('encode');
  const [status, setStatus] = useState<AppStatus>('ready');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputContent, setInputContent] = useState<string>('');
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [encodedData, setEncodedData] = useState<Uint8Array | null>(null);
  const [encodingResult, setEncodingResult] = useState<EncodingResult | null>(null);
  const [decodingResult, setDecodingResult] = useState<DecodingResult | null>(null);
  const [frequencyData, setFrequencyData] = useState<FrequencyItem[]>([]);
  const [huffmanTree, setHuffmanTree] = useState<HuffmanNode | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastEncodedData, setLastEncodedData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const handleModeChange = useCallback((newMode: OperationMode) => {
    setMode(newMode);
    // Don't clear data automatically - keep existing state until user manually clears
    setProgress(0);
    setStatus('ready');
    addLog(`Switched to ${newMode.toUpperCase()} mode`, 'info');
  }, [addLog]);

  const handleLoadPreviousEncoded = useCallback(() => {
    if (lastEncodedData) {
      setEncodedData(lastEncodedData);
      setOutputFileName('decoded_output.txt');
      addLog('Previous encoded data loaded! Click "START DECODING" to decode.', 'success');
    }
  }, [lastEncodedData, addLog]);

  const handleLoadSampleText = useCallback(() => {
    const sampleText = `Hello, World! This is a sample text for Huffman encoding demonstration.

Huffman coding is a lossless data compression algorithm. The idea is to assign variable-length codes to input characters, with shorter codes assigned to more frequent characters.

This sample contains various characters:
- Letters: ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz
- Numbers: 0123456789
- Special: !@#$%^&*()_+-=[]{}|;':",./<>?

The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.

你好世界！这是一个测试文本。

Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;

    setInputContent(sampleText);
    setInputFile(new File([sampleText], 'sample_text.txt', { type: 'text/plain' }));
    setOutputFileName('sample_text.txt.huff');
    setStatus('ready');
    addLog('📝 Sample text loaded successfully! Click "Start Processing" to encode.', 'success');
  }, [addLog]);

  const handleInputFileSelect = useCallback(async (file: File) => {
    setInputFile(file);
    addLog(`Selected input file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, 'info');

    if (mode === 'encode') {
      const text = await file.text();
      setInputContent(text);
      setOutputFileName(file.name + '.huff');
    } else {
      const buffer = await file.arrayBuffer();
      setEncodedData(new Uint8Array(buffer));
      setOutputFileName(file.name.replace('.huff', '.txt'));
    }
    setStatus('ready');
  }, [mode, addLog]);

  const handleProcess = useCallback(async () => {
    if (!inputFile) {
      addLog('No input file selected', 'error');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setProgress(0);
    setElapsedTime(0);
    const startTime = Date.now();

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      addLog(`Starting ${mode} operation...`, 'info');
      setProgress(10);

      await new Promise(r => setTimeout(r, 100));
      setProgress(30);

      if (mode === 'encode') {
        addLog('Analyzing character frequencies...', 'info');
        setProgress(50);

        const result = encode(inputContent);
        setEncodingResult(result);
        setFrequencyData(result.analysis);
        setHuffmanTree(result.tree);
        setLastEncodedData(result.encodedData); // Store for auto-load in decode mode
        setEncodedData(result.encodedData); // Also set as current encoded data

        setProgress(80);
        addLog(`Generated ${result.analysis.length} unique character codes`, 'success');
        addLog(`Compression complete: ${result.statistics.spaceSaved}% space saved`, 'success');
        addLog('💡 Tip: Switch to Decode mode to decode this data!', 'info');
      } else {
        if (!encodedData) {
          throw new Error('No encoded data to decode');
        }

        addLog('Decoding Huffman data...', 'info');
        setProgress(50);

        const result = decode(encodedData);
        setDecodingResult(result);

        setProgress(80);
        addLog(`Decoded ${result.statistics.totalChars} characters successfully`, 'success');
      }

      setProgress(100);
      setStatus('complete');
      addLog('Operation completed successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error: ${message}`, 'error');
      setStatus('error');
    } finally {
      clearInterval(timer);
      setIsProcessing(false);
    }
  }, [inputFile, inputContent, encodedData, mode, addLog]);

  const handleDownload = useCallback(() => {
    if (mode === 'encode' && encodingResult) {
      const blob = new Blob([encodingResult.encodedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName || 'encoded.huff';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addLog(`Downloaded: ${outputFileName}`, 'success');
    } else if (mode === 'decode' && decodingResult) {
      const blob = new Blob([decodingResult.decodedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName || 'decoded.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addLog(`Downloaded: ${outputFileName}`, 'success');
    }
  }, [mode, encodingResult, decodingResult, outputFileName, addLog]);

  const handleClearAll = useCallback(() => {
    setInputFile(null);
    setInputContent('');
    setOutputFileName('');
    setEncodedData(null);
    setEncodingResult(null);
    setDecodingResult(null);
    setFrequencyData([]);
    setHuffmanTree(null);
    setProgress(0);
    setElapsedTime(0);
    setStatus('ready');
    addLog('All data cleared', 'info');
  }, [addLog]);

  const handleExportReport = useCallback(() => {
    if (!encodingResult && !decodingResult) {
      addLog('No data to export', 'warning');
      return;
    }

    let reportContent = '=== HUFFMAN ENCODER/DECODER REPORT ===\n\n';
    reportContent += `Generated: ${new Date().toLocaleString()}\n`;
    reportContent += `Mode: ${mode.toUpperCase()}\n\n`;

    if (encodingResult) {
      reportContent += '--- COMPRESSION STATISTICS ---\n';
      reportContent += `Original Size: ${encodingResult.statistics.originalSize} bytes\n`;
      reportContent += `Compressed Size: ${encodingResult.statistics.encodedSize} bytes\n`;
      reportContent += `Compression Ratio: ${encodingResult.statistics.compressionRatio}%\n`;
      reportContent += `Space Saved: ${encodingResult.statistics.spaceSaved}%\n\n`;
      reportContent += '--- CHARACTER FREQUENCY TABLE ---\n';
      reportContent += 'Character,ASCII,Frequency,Huffman Code,Bit Length\n';
      encodingResult.analysis.forEach(item => {
        reportContent += `${item.display},${item.char.charCodeAt(0)},${item.count},${item.code},${item.code.length}\n`;
      });
    }

    if (decodingResult) {
      reportContent += '--- DECODING STATISTICS ---\n';
      reportContent += `Encoded Size: ${decodingResult.statistics.encodedSize} bytes\n`;
      reportContent += `Decoded Size: ${decodingResult.statistics.decodedSize} bytes\n`;
      reportContent += `Total Characters: ${decodingResult.statistics.totalChars}\n`;
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'huffman_report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog('Report exported successfully', 'success');
  }, [encodingResult, decodingResult, mode, addLog]);

  const bgColor = 'bg-transparent';
  const textColor = 'text-gray-100';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300 relative`}>
      <div className="stars-bg" />
      <div className="relative z-10">
      <MenuBar
        darkMode={darkMode}
        onNewSession={handleClearAll}
        onOpenFile={() => document.getElementById('file-input')?.click()}
        onExportReport={handleExportReport}
        onViewTree={() => setShowTreeModal(true)}
        hasTree={!!huffmanTree}
      />

      <div className="max-w-[1200px] mx-auto p-4">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient glow-text">
              Huffman Encoder/Decoder Pro
            </h1>
            <p className="text-sm text-purple-300/70">
              Specialized Course Design Project - Data Compression Tool
            </p>
          </div>
        </header>

        <ModeSelector mode={mode} onModeChange={handleModeChange} darkMode={darkMode} />

        <FileSelection
          mode={mode}
          inputFile={inputFile}
          outputFileName={outputFileName}
          onInputFileSelect={handleInputFileSelect}
          onOutputFileNameChange={setOutputFileName}
          darkMode={darkMode}
          inputContent={inputContent}
          onInputContentChange={setInputContent}
          onLoadSampleText={handleLoadSampleText}
          onProcess={handleProcess}
          isProcessing={isProcessing}
          hasEncodedDataReady={!!lastEncodedData}
          encodedData={encodedData}
          onLoadPreviousEncoded={handleLoadPreviousEncoded}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <StatisticsPanel
            frequencyData={frequencyData}
            darkMode={darkMode}
          />
          <CompressionPanel
            encodingResult={encodingResult}
            decodingResult={decodingResult}
            mode={mode}
            darkMode={darkMode}
          />
        </div>

        {mode === 'encode' && frequencyData.length > 0 && (
          <CodeTable frequencyData={frequencyData} darkMode={darkMode} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ProgressSection
            status={status}
            progress={progress}
            elapsedTime={elapsedTime}
            darkMode={darkMode}
          />
          <OperationLog
            logs={logs}
            onClear={clearLogs}
            darkMode={darkMode}
          />
        </div>

        <ActionButtons
          onClear={handleClearAll}
          onViewTree={() => setShowTreeModal(true)}
          onDownload={handleDownload}
          isProcessing={isProcessing}
          hasResult={!!(encodingResult || decodingResult)}
          hasTree={!!huffmanTree}
          darkMode={darkMode}
        />
      </div>

      <StatusBar
        status={status}
        fileName={inputFile?.name}
        fileSize={inputFile?.size}
        darkMode={darkMode}
      />

      {showTreeModal && huffmanTree && (
        <TreeModal
          tree={huffmanTree}
          onClose={() => setShowTreeModal(false)}
          darkMode={darkMode}
        />
      )}

      <input
        id="file-input"
        type="file"
        accept={mode === 'encode' ? '.txt,.md,.html,.css,.js,.json,.xml,.csv' : '.huff'}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleInputFileSelect(file);
        }}
        className="hidden"
      />
      </div>
    </div>
  );
}

export default App;
