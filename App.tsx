
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CellData, CellColor } from './types';
import GridCell from './components/GridCell';
import ColorStatsAnimator from './components/ColorStatsAnimator';

const ROWS = 19;
const COLS = 9;

const App: React.FC = () => {
  const [cells, setCells] = useState<CellData[]>(() => {
    const initialCells: CellData[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        initialCells.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          text: '',
          color: CellColor.NONE,
        });
      }
    }
    return initialCells;
  });

  const [brushColor, setBrushColor] = useState<CellColor>(CellColor.RED);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // 全局鼠标状态追踪
  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleTextChange = useCallback((id: string, text: string) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, text } : c));
  }, []);

  const applyColor = useCallback((id: string, force?: boolean) => {
    if (isAnimating) return;
    if (force || isMouseDown) {
      setCells(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, color: brushColor };
        }
        return c;
      }));
    }
  }, [brushColor, isMouseDown, isAnimating]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (isAnimating) return;
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const rows = pasteData.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    setCells(prev => {
      const newCells = [...prev];
      rows.forEach((rowText, rIdx) => {
        if (rIdx >= ROWS) return;
        const cols = rowText.split(/\t/);
        cols.forEach((colText, cIdx) => {
          if (cIdx >= COLS) return;
          const targetIdx = newCells.findIndex(c => c.row === rIdx && c.col === cIdx);
          if (targetIdx !== -1) {
            newCells[targetIdx] = { ...newCells[targetIdx], text: colText.trim() };
          }
        });
      });
      return newCells;
    });
  }, [isAnimating]);

  const clearAll = () => {
    if (confirm('确定清空所有数据和颜色吗？')) {
      setCells(prev => prev.map(c => ({ ...c, text: '', color: CellColor.NONE })));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* 动画遮罩层 - 放在最外层以便覆盖全屏 */}
      <ColorStatsAnimator 
        cells={cells} 
        isAnimating={isAnimating} 
        onClose={() => setIsAnimating(false)} 
      />

      {/* 顶部工具栏 */}
      <header className={`sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 shadow-xl transition-all duration-500 ${isAnimating ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xl font-black">G</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase">Grid Morph <span className="text-blue-500 text-sm">Ultra</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Staggered Animation • 19 × 9 Matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 shadow-inner">
            <button 
              onMouseDown={() => setBrushColor(CellColor.RED)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all ${brushColor === CellColor.RED ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-105' : 'hover:bg-slate-700 text-slate-400'}`}
            >
              <div className={`w-3 h-3 rounded-full border-2 border-white/30 ${brushColor === CellColor.RED ? 'bg-white' : 'bg-red-500'}`}></div>
              <span className="text-xs font-bold whitespace-nowrap">红刷子</span>
            </button>
            <button 
              onMouseDown={() => setBrushColor(CellColor.GREEN)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all ${brushColor === CellColor.GREEN ? 'bg-green-500 text-white shadow-lg shadow-green-500/40 scale-105' : 'hover:bg-slate-700 text-slate-400'}`}
            >
              <div className={`w-3 h-3 rounded-full border-2 border-white/30 ${brushColor === CellColor.GREEN ? 'bg-white' : 'bg-green-500'}`}></div>
              <span className="text-xs font-bold whitespace-nowrap">绿刷子</span>
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button 
              onMouseDown={() => setBrushColor(CellColor.NONE)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all ${brushColor === CellColor.NONE ? 'bg-slate-200 text-slate-900 shadow-lg scale-105' : 'hover:bg-slate-700 text-slate-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold whitespace-nowrap">橡皮擦</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsAnimating(true)}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 shadow-blue-500/20"
            >
              ✨ 开启统计大片
            </button>
            <button 
              onClick={clearAll}
              className="p-2.5 bg-slate-800 hover:bg-red-900/40 rounded-xl transition-all border border-slate-700 group"
              title="清空表格"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 主表格区域 */}
      <main className={`flex-1 p-6 flex items-start justify-center overflow-auto transition-all duration-700 ${isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`} onPaste={handlePaste}>
        <div 
          ref={gridRef}
          className="relative bg-slate-900 rounded-2xl border-4 border-slate-800/50 shadow-2xl"
          style={{ width: 'fit-content' }}
        >
          {/* 表格标题栏 */}
          <div className="grid grid-cols-[40px_repeat(9,100px)] bg-slate-800/50 border-b border-slate-700 font-mono">
            <div className="h-10 flex items-center justify-center bg-slate-800 rounded-tl-xl border-r border-slate-700 text-slate-500 font-bold">#</div>
            {['A','B','C','D','E','F','G','H','I'].map(l => (
              <div key={l} className="flex items-center justify-center text-[11px] font-black text-slate-500 border-l border-slate-700/30 uppercase tracking-widest">{l}</div>
            ))}
          </div>

          {/* 表格行内容 */}
          <div className="flex flex-col">
            {Array.from({ length: ROWS }).map((_, r) => (
              <div key={`row-${r}`} className="grid grid-cols-[40px_repeat(9,100px)] border-b border-slate-800/50 last:border-0 group">
                <div className="flex items-center justify-center text-[10px] font-bold text-slate-600 bg-slate-800/20 group-hover:bg-slate-800 transition-colors border-r border-slate-700/50">{r + 1}</div>
                {Array.from({ length: COLS }).map((_, c) => {
                  const cell = cells.find(item => item.row === r && item.col === c)!;
                  return (
                    <GridCell 
                      key={cell.id} 
                      cell={cell} 
                      onTextChange={handleTextChange} 
                      onMouseEnter={() => applyColor(cell.id)}
                      onMouseDown={() => applyColor(cell.id, true)}
                      isAnimating={isAnimating}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 状态指示器 */}
      <footer className={`p-4 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto flex justify-center gap-6">
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Red: {cells.filter(c => c.color === CellColor.RED).length}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Green: {cells.filter(c => c.color === CellColor.GREEN).length}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
