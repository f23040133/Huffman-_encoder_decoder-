import { Activity, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { AppStatus } from '../App';

interface ProgressSectionProps {
  status: AppStatus;
  progress: number;
  elapsedTime: number;
  darkMode: boolean;
}

export function ProgressSection({ status, progress, elapsedTime, darkMode }: ProgressSectionProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

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

  const getProgressBarColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500';
      case 'complete':
        return 'bg-gradient-to-r from-emerald-500 to-green-500';
      case 'error':
        return 'bg-gradient-to-r from-rose-500 to-red-500';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="p-4 rounded-xl glass-card-dark">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white">
          Processing Status
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{progress}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Elapsed Time</span>
            </div>
            <p className="text-lg font-mono font-bold mt-1 text-white">
              {formatTime(elapsedTime)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">ETA</span>
            </div>
            <p className="text-lg font-mono font-bold mt-1 text-white">
              {status === 'processing' && progress > 0
                ? formatTime(Math.round(elapsedTime * (100 - progress) / progress))
                : '--:--'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
