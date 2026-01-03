import { Lock, Unlock } from 'lucide-react';
import type { OperationMode } from '../App';

interface ModeSelectorProps {
  mode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
  darkMode: boolean;
}

export function ModeSelector({ mode, onModeChange, darkMode }: ModeSelectorProps) {
  const baseClasses = 'flex-1 py-4 px-6 font-bold text-lg rounded-lg transition-all duration-300 flex items-center justify-center gap-3';

  const encodeClasses = mode === 'encode'
    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg glow-cyan ring-2 ring-emerald-400/50'
    : 'glass-button text-gray-400 hover:text-white';

  const decodeClasses = mode === 'decode'
    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg glow-cyan ring-2 ring-cyan-400/50'
    : 'glass-button text-gray-400 hover:text-white';

  return (
    <div className="p-4 rounded-xl mb-4 glass-card-dark">
      <div className="flex gap-4">
        <button
          onClick={() => onModeChange('encode')}
          className={`${baseClasses} ${encodeClasses}`}
        >
          <Lock className="w-5 h-5" />
          ENCODE MODE
        </button>
        <button
          onClick={() => onModeChange('decode')}
          className={`${baseClasses} ${decodeClasses}`}
        >
          <Unlock className="w-5 h-5" />
          DECODE MODE
        </button>
      </div>
      <p className="text-center text-sm mt-3 text-purple-300/70">
        {mode === 'encode'
          ? 'Compress text files using Huffman encoding algorithm'
          : 'Restore original text from Huffman-encoded files'}
      </p>
    </div>
  );
}
