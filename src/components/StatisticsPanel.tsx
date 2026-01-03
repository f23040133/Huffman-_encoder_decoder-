import { BarChart3 } from 'lucide-react';
import type { FrequencyItem } from '../lib/huffman';

interface StatisticsPanelProps {
  frequencyData: FrequencyItem[];
  darkMode: boolean;
}

export function StatisticsPanel({ frequencyData, darkMode }: StatisticsPanelProps) {
  const getFrequencyColor = (percentage: number) => {
    if (percentage >= 10) return 'text-rose-400';
    if (percentage >= 5) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 10) return 'bg-gradient-to-r from-rose-500 to-pink-500';
    if (percentage >= 5) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-emerald-500 to-green-500';
  };

  const sortedData = [...frequencyData].sort((a, b) => b.count - a.count);

  return (
    <div className="p-4 rounded-xl glass-card-dark">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white">
          Character Frequency Analysis
        </h3>
      </div>

      <div className="rounded-lg p-3 max-h-[200px] overflow-y-auto bg-white/5 scrollbar-thin">
        {frequencyData.length === 0 ? (
          <p className="text-sm text-center py-8 text-gray-500">
            Process a file to see frequency analysis
          </p>
        ) : (
          <div className="space-y-1.5">
            {sortedData.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
                <code className="px-2 py-0.5 rounded font-mono text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.display}
                </code>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(item.percentage)}`}
                    style={{ width: `${Math.min(item.percentage * 5, 100)}%` }}
                  />
                </div>
                <span className={`text-xs w-20 text-right ${getFrequencyColor(item.percentage)}`}>
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
