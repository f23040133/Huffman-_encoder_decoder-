import { Circle, FileText, HardDrive } from 'lucide-react';
import type { AppStatus } from '../App';

interface StatusBarProps {
  status: AppStatus;
  fileName?: string;
  fileSize?: number;
  darkMode: boolean;
}

export function StatusBar({ status, fileName, fileSize, darkMode }: StatusBarProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-cyan-400';
      case 'complete':
        return 'text-emerald-400';
      case 'error':
        return 'text-rose-400';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 backdrop-blur-xl bg-black/40">
      <div className="max-w-[1200px] mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 ${getStatusColor()}`}>
            <Circle className="w-2 h-2 fill-current" />
            <span>{getStatusText()}</span>
          </div>

          {fileName && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <FileText className="w-3 h-3" />
              <span>{fileName}</span>
            </div>
          )}

          {fileSize !== undefined && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <HardDrive className="w-3 h-3" />
              <span>{formatBytes(fileSize)}</span>
            </div>
          )}
        </div>

        <div className="text-purple-300/70">
          Specialized Course Design Project - Md Myan Uddin | F23040133
        </div>
      </div>
    </div>
  );
}
