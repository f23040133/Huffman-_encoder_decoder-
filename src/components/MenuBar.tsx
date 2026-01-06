import { useState, useRef, useEffect } from 'react';
import { Menu, FileText, Wrench, HelpCircle, Plus, FolderOpen, Save, X, GitBranch, FileStack, Info, BookOpen, User, Code2, GraduationCap } from 'lucide-react';

interface MenuBarProps {
  darkMode: boolean;
  onNewSession: () => void;
  onOpenFile: () => void;
  onExportReport: () => void;
  onViewTree: () => void;
  hasTree: boolean;
}

type MenuId = 'file' | 'tools' | 'help' | null;
type ModalType = 'userGuide' | 'algorithmInfo' | 'about' | 'batchProcessing' | null;

export function MenuBar({
  darkMode,
  onNewSession,
  onOpenFile,
  onExportReport,
  onViewTree,
  hasTree,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<MenuId>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MenuItem = ({
    icon: Icon,
    label,
    shortcut,
    onClick,
    disabled,
  }: {
    icon: React.ElementType;
    label: string;
    shortcut?: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => {
        if (!disabled) {
          onClick();
          setActiveMenu(null);
        }
      }}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-2 text-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500/20'}
        text-white
      `}
    >
      <Icon className="w-4 h-4 text-purple-400" />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-xs text-purple-300">
          {shortcut}
        </span>
      )}
    </button>
  );

  const MenuButton = ({ id, label }: { id: MenuId; label: string }) => (
    <button
      onClick={() => setActiveMenu(activeMenu === id ? null : id)}
      className={`
        px-4 py-2 text-sm font-medium transition-colors
        ${activeMenu === id ? 'bg-purple-500/30 text-white' : 'hover:bg-purple-500/20 text-white'}
      `}
    >
      {label}
    </button>
  );

  const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border-2 border-purple-500/50 shadow-2xl" style={{ backgroundColor: '#1a1a2e', zIndex: 10000 }}>
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30" style={{ backgroundColor: '#16213e' }}>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-purple-500/20 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin text-white" style={{ backgroundColor: '#1a1a2e' }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div ref={menuRef} className="border-b border-white/10 backdrop-blur-xl bg-black/50" style={{ position: 'relative', zIndex: 9000 }}>
        <div className="max-w-[1200px] mx-auto flex items-center">
          <div className="p-2 text-purple-400">
            <Menu className="w-5 h-5" />
          </div>

          <div className="relative">
            <MenuButton id="file" label="File" />
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 w-56 rounded-lg shadow-2xl py-1 border border-purple-500/30" style={{ zIndex: 9999, backgroundColor: '#1a1a2e' }}>
                <MenuItem icon={Plus} label="New Session" shortcut="Ctrl+N" onClick={onNewSession} />
                <MenuItem icon={FolderOpen} label="Open Input File" shortcut="Ctrl+O" onClick={onOpenFile} />
                <MenuItem icon={Save} label="Export Report" shortcut="Ctrl+S" onClick={onExportReport} />
                <div className="my-1 border-t border-purple-500/30" />
                <MenuItem icon={X} label="Exit" shortcut="Alt+F4" onClick={() => window.close()} />
              </div>
            )}
          </div>

          <div className="relative">
            <MenuButton id="tools" label="Tools" />
            {activeMenu === 'tools' && (
              <div className="absolute top-full left-0 w-56 rounded-lg shadow-2xl py-1 border border-purple-500/30" style={{ zIndex: 9999, backgroundColor: '#1a1a2e' }}>
                <MenuItem icon={GitBranch} label="View Huffman Tree" onClick={onViewTree} disabled={!hasTree} />
                <MenuItem icon={FileStack} label="Batch Processing" onClick={() => setActiveModal('batchProcessing')} />
              </div>
            )}
          </div>

          <div className="relative">
            <MenuButton id="help" label="Help" />
            {activeMenu === 'help' && (
              <div className="absolute top-full left-0 w-56 rounded-lg shadow-2xl py-1 border border-purple-500/30" style={{ zIndex: 9999, backgroundColor: '#1a1a2e' }}>
                <MenuItem icon={BookOpen} label="User Guide" onClick={() => setActiveModal('userGuide')} />
                <MenuItem icon={Code2} label="Algorithm Info" onClick={() => setActiveModal('algorithmInfo')} />
                <div className="my-1 border-t border-purple-500/30" />
                <MenuItem icon={Info} label="About" onClick={() => { setActiveMenu(null); setActiveModal('about'); }} />
              </div>
            )}
          </div>

          <div className="flex-1" />

          <div className="px-4 py-2 text-xs text-purple-300">
            <span className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Huffman Encoder/Decoder Pro v1.0
            </span>
          </div>
        </div>
      </div>

      {/* User Guide Modal */}
      {activeModal === 'userGuide' && (
        <Modal title="📖 User Guide" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Getting Started
              </h3>
              <p className="mb-2 text-gray-200">Welcome to Huffman Encoder/Decoder Pro! This tool helps you compress and decompress text files using Huffman coding algorithm.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📝</span> How to Encode (Compress)
              </h3>
              <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-200">
                <li>Select <strong className="text-purple-300">"Encode"</strong> mode from the mode selector</li>
                <li>Click <strong className="text-purple-300">"Select Input File"</strong> or drag & drop a text file</li>
                <li>Supported formats: .txt, .md, .html, .css, .js, .json, .xml, .csv</li>
                <li>Click <strong className="text-purple-300">"Process"</strong> to start compression</li>
                <li>View the character frequency analysis and Huffman codes generated</li>
                <li>Click <strong className="text-purple-300">"Download"</strong> to save the compressed .bin file</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📂</span> How to Decode (Decompress)
              </h3>
              <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-200">
                <li>Select <strong className="text-purple-300">"Decode"</strong> mode from the mode selector</li>
                <li>Click <strong className="text-purple-300">"Select Input File"</strong> and choose a .bin file</li>
                <li>Click <strong className="text-purple-300">"Process"</strong> to start decompression</li>
                <li>Click <strong className="text-purple-300">"Download"</strong> to save the decompressed text file</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">🌳</span> View Huffman Tree
              </h3>
              <p className="text-gray-200">After encoding a file, you can visualize the generated Huffman tree by clicking <strong className="text-purple-300">"View Tree"</strong> button or using Tools → View Huffman Tree menu.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📊</span> Export Report
              </h3>
              <p className="text-gray-200">Generate a detailed report containing compression statistics, character frequencies, and Huffman codes by clicking <strong className="text-purple-300">"Export Report"</strong> or using File → Export Report menu.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">⌨️</span> Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
                <div className="flex justify-between"><span>New Session</span><kbd className="px-2 py-1 bg-purple-500/30 rounded text-purple-200">Ctrl+N</kbd></div>
                <div className="flex justify-between"><span>Open File</span><kbd className="px-2 py-1 bg-purple-500/30 rounded text-purple-200">Ctrl+O</kbd></div>
                <div className="flex justify-between"><span>Export Report</span><kbd className="px-2 py-1 bg-purple-500/30 rounded text-purple-200">Ctrl+S</kbd></div>
              </div>
            </section>
          </div>
        </Modal>
      )}

      {/* Algorithm Info Modal */}
      {activeModal === 'algorithmInfo' && (
        <Modal title="🔬 Algorithm Information" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📚</span> What is Huffman Coding?
              </h3>
              <p className="mb-3 text-gray-200">Huffman coding is a lossless data compression algorithm developed by David A. Huffman in 1952. It is a variable-length prefix coding technique that assigns shorter codes to more frequent characters and longer codes to less frequent ones.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> How It Works
              </h3>
              <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-200">
                <li><strong className="text-purple-300">Frequency Analysis:</strong> Count the frequency of each character in the input</li>
                <li><strong className="text-purple-300">Build Priority Queue:</strong> Create leaf nodes for each character and add to a min-heap</li>
                <li><strong className="text-purple-300">Build Huffman Tree:</strong> Repeatedly extract two minimum nodes and combine them until one node remains</li>
                <li><strong className="text-purple-300">Generate Codes:</strong> Traverse the tree to assign binary codes (left=0, right=1)</li>
                <li><strong className="text-purple-300">Encode Data:</strong> Replace each character with its Huffman code</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📐</span> Time & Space Complexity
              </h3>
              <div className="bg-gray-800/50 border border-purple-500/20 rounded-lg p-4 space-y-2 text-gray-200">
                <div className="flex justify-between">
                  <span>Building Tree:</span>
                  <code className="text-purple-300">O(n log n)</code>
                </div>
                <div className="flex justify-between">
                  <span>Encoding:</span>
                  <code className="text-purple-300">O(n)</code>
                </div>
                <div className="flex justify-between">
                  <span>Decoding:</span>
                  <code className="text-purple-300">O(n)</code>
                </div>
                <div className="flex justify-between">
                  <span>Space:</span>
                  <code className="text-purple-300">O(k)</code>
                  <span className="text-xs text-gray-400">(k = unique characters)</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">✨</span> Key Properties
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-2 text-gray-200">
                <li><strong className="text-purple-300">Prefix-Free:</strong> No code is a prefix of another (ensures unique decodability)</li>
                <li><strong className="text-purple-300">Optimal:</strong> Produces minimum expected code length for known symbol probabilities</li>
                <li><strong className="text-purple-300">Lossless:</strong> Original data can be perfectly reconstructed</li>
                <li><strong className="text-purple-300">Greedy Algorithm:</strong> Makes locally optimal choices at each step</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📈</span> Compression Ratio
              </h3>
              <p className="mb-2 text-gray-200">The compression ratio depends on the frequency distribution of characters. Best case scenarios include:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-gray-200">
                <li>Text with highly skewed character frequencies</li>
                <li>Files with many repeated characters</li>
                <li>Natural language text (typically 40-60% compression)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">🔗</span> Applications
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2 text-gray-200">
                <li>File compression (ZIP, GZIP)</li>
                <li>Image compression (JPEG, PNG)</li>
                <li>Network data transmission</li>
                <li>Multimedia codecs (MP3, MPEG)</li>
              </ul>
            </section>
          </div>
        </Modal>
      )}

      {/* About Modal */}
      {activeModal === 'about' && (
        <Modal title="ℹ️ About" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/30 mb-4">
                <Code2 className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Huffman Encoder/Decoder Pro</h2>
              <p className="text-purple-300">Version 1.0.0</p>
            </div>

            <section className="rounded-xl p-4 border border-purple-500/30" style={{ backgroundColor: '#0f0f23' }}>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Course Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Course Name:</span>
                  <span className="text-white font-medium">Specialized Course Design</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Project:</span>
                  <span className="text-white font-medium">Course Design Project-1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Instructor:</span>
                  <span className="text-white font-medium">Prof. Rui Huang</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Year:</span>
                  <span className="text-white font-medium">2025</span>
                </div>
              </div>
            </section>

            <section className="rounded-xl p-4 border border-purple-500/30" style={{ backgroundColor: '#0f0f23' }}>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Developer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Student Name:</span>
                  <span className="text-white font-medium">Md Myan Uddin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Student ID:</span>
                  <span className="text-white font-medium">F23040133</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Major:</span>
                  <span className="text-white font-medium">Computer Science and Technology</span>
                </div>
              </div>
            </section>

            <section className="rounded-xl p-4 border border-purple-500/30" style={{ backgroundColor: '#0f0f23' }}>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Python', 'FastAPI'].map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-full text-xs text-purple-200 border border-purple-400 font-medium" style={{ backgroundColor: '#2d1b4e' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-xl p-4 border border-purple-500/30" style={{ backgroundColor: '#0f0f23' }}>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">📋 Project Description</h3>
              <p className="text-sm leading-relaxed text-gray-200">
                This application is a specialized course design project demonstrating the implementation of Huffman coding algorithm 
                for data compression. It provides a visual and interactive way to understand how Huffman encoding and 
                decoding works, including character frequency analysis, Huffman tree visualization, and compression 
                statistics.
              </p>
            </section>

            <div className="text-center text-xs text-gray-400 pt-4 border-t border-purple-500/20">
              <p>© 2025 Specialized Course Design Project-1</p>
              <p className="mt-1">Created by Md Myan Uddin (F23040133)</p>
              <p className="mt-1">Built with ❤️ for learning purposes</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Batch Processing Modal */}
      {activeModal === 'batchProcessing' && (
        <Modal title="📦 Batch Processing" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📁</span> Select Multiple Files
              </h3>
              <p className="text-gray-200 mb-4">Process multiple files at once for efficient encoding or decoding.</p>
              
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.html,.css,.js,.json,.xml,.csv,.bin"
                  className="hidden"
                  id="batch-file-input"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      alert(`Selected ${files.length} file(s) for batch processing.\n\nNote: Batch processing feature is a preview. Files will be processed sequentially.`);
                    }
                  }}
                />
                <label htmlFor="batch-file-input" className="cursor-pointer">
                  <FileStack className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-400">Supports: .txt, .md, .html, .css, .js, .json, .xml, .csv, .bin</p>
                </label>
              </div>
            </section>

            <section className="rounded-xl p-4 bg-gray-800/50 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Batch Options
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="batchMode" value="encode" defaultChecked className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-200">Encode all files (compress)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="batchMode" value="decode" className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-200">Decode all files (decompress)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500 rounded" />
                  <span className="text-gray-200">Generate individual reports for each file</span>
                </label>
              </div>
            </section>

            <section className="rounded-xl p-4 bg-gray-800/50 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">📊</span> Output Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Output folder name:</label>
                  <input 
                    type="text" 
                    defaultValue="huffman_output" 
                    className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500 rounded" />
                  <span className="text-gray-200">Download as ZIP archive</span>
                </label>
              </div>
            </section>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Batch processing will start. Please select files first using the file picker above.');
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-purple-500/30 text-purple-200 hover:bg-purple-500/40 border border-purple-500/50 transition-colors font-medium"
              >
                Start Batch Processing
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
