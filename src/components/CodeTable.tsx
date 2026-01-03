import { useState, useMemo } from 'react';
import { Table, ChevronUp, ChevronDown, Download } from 'lucide-react';
import type { FrequencyItem } from '../lib/huffman';

interface CodeTableProps {
  frequencyData: FrequencyItem[];
  darkMode: boolean;
}

type SortKey = 'char' | 'ascii' | 'frequency' | 'code' | 'bitLength';
type SortDirection = 'asc' | 'desc';

export function CodeTable({ frequencyData, darkMode }: CodeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('frequency');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...frequencyData].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'char':
          comparison = a.char.localeCompare(b.char);
          break;
        case 'ascii':
          comparison = a.char.charCodeAt(0) - b.char.charCodeAt(0);
          break;
        case 'frequency':
          comparison = a.count - b.count;
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'bitLength':
          comparison = a.code.length - b.code.length;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [frequencyData, sortKey, sortDirection]);

  const exportCSV = () => {
    const headers = 'Character,ASCII,Frequency,Huffman Code,Bit Length\n';
    const rows = frequencyData.map(item =>
      `"${item.display}",${item.char.charCodeAt(0)},${item.count},${item.code},${item.code.length}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'huffman_codes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const SortableHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 text-gray-400 transition-colors"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          sortDirection === 'asc'
            ? <ChevronUp className="w-3 h-3 text-purple-400" />
            : <ChevronDown className="w-3 h-3 text-purple-400" />
        )}
      </div>
    </th>
  );

  return (
    <div className="p-4 rounded-xl mb-4 glass-card-dark">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">
            Huffman Code Table
          </h3>
        </div>
        <button
          onClick={exportCSV}
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors glass-button text-gray-300 hover:text-white"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="rounded-lg border overflow-hidden border-white/10">
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
          <table className="w-full">
            <thead className="sticky top-0 bg-black/50 backdrop-blur-sm">
              <tr className="border-b border-white/10">
                <SortableHeader label="Character" sortKeyName="char" />
                <SortableHeader label="ASCII" sortKeyName="ascii" />
                <SortableHeader label="Frequency" sortKeyName="frequency" />
                <SortableHeader label="Huffman Code" sortKeyName="code" />
                <SortableHeader label="Bit Length" sortKeyName="bitLength" />
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {sortedData.map((item, index) => (
                <tr key={index} className="border-b border-white/5 even:bg-white/5 hover:bg-white/10 transition-colors">
                  <td className="px-4 py-2">
                    <code className="px-2 py-0.5 rounded text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.display}
                    </code>
                  </td>
                  <td className="px-4 py-2 text-sm font-mono">{item.char.charCodeAt(0)}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="font-semibold text-white">{item.count}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({item.percentage}%)
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <code className="text-xs font-mono text-cyan-400">{item.code}</code>
                  </td>
                  <td className="px-4 py-2 text-sm font-mono">{item.code.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs mt-2 text-gray-500">
        {frequencyData.length} unique characters | Click column headers to sort
      </p>
    </div>
  );
}
