import { useRef, useEffect } from 'react';
import { ScrollText, Trash2 } from 'lucide-react';
import type { LogEntry } from '../App';

interface OperationLogProps {
  logs: LogEntry[];
  onClear: () => void;
  darkMode: boolean;
}

export function OperationLog({ logs, onClear, darkMode }: OperationLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      default:
        return 'text-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="p-4 rounded-xl glass-card-dark">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">
            Operation Log
          </h3>
        </div>
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors glass-button text-gray-300 hover:text-white"
        >
          <Trash2 className="w-4 h-4" />
          Clear Log
        </button>
      </div>

      <div
        ref={scrollRef}
        className="rounded-lg p-3 max-h-[200px] overflow-y-auto font-mono text-xs bg-white/5 scrollbar-thin"
      >
        {logs.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No log entries yet
          </p>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-purple-400/70">
                  [{formatTime(log.timestamp)}]
                </span>
                <span className={getLogColor(log.type)}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
