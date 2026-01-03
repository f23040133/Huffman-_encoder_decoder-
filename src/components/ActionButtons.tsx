import { RotateCcw, GitBranch, Download } from 'lucide-react';

interface ActionButtonsProps {
  onClear: () => void;
  onViewTree: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  hasResult: boolean;
  hasTree: boolean;
  darkMode: boolean;
}

export function ActionButtons({
  onClear,
  onViewTree,
  onDownload,
  isProcessing,
  hasResult,
  hasTree,
  darkMode,
}: ActionButtonsProps) {
  return (
    <div className="p-4 rounded-xl mb-4 glass-card-dark">
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onDownload}
          disabled={!hasResult || isProcessing}
          className={`
            px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
            ${!hasResult || isProcessing
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white active:scale-95 shadow-lg shadow-cyan-500/30'
            }
          `}
        >
          <Download className="w-5 h-5" />
          DOWNLOAD OUTPUT
        </button>

        <button
          onClick={onClear}
          disabled={isProcessing}
          className={`
            px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all
            ${isProcessing
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'glass-button text-gray-300 hover:text-white active:scale-95'
            }
          `}
        >
          <RotateCcw className="w-5 h-5" />
          CLEAR ALL
        </button>

        <button
          onClick={onViewTree}
          disabled={!hasTree || isProcessing}
          className={`
            px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all
            ${!hasTree || isProcessing
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white active:scale-95 shadow-lg shadow-purple-500/30'
            }
          `}
        >
          <GitBranch className="w-5 h-5" />
          VIEW TREE
        </button>
      </div>
    </div>
  );
}
