
import React, { useMemo, useEffect, useState } from 'react';
import { CellData, CellColor } from '../types';

interface ColorStatsAnimatorProps {
  cells: CellData[];
  isAnimating: boolean;
  onClose: () => void;
}

const ColorStatsAnimator: React.FC<ColorStatsAnimatorProps> = ({ cells, isAnimating, onClose }) => {
  const [showStats, setShowStats] = useState(false);
  
  const coloredCells = useMemo(() => cells.filter(c => c.color !== CellColor.NONE), [cells]);
  const redCells = coloredCells.filter(c => c.color === CellColor.RED);
  const greenCells = coloredCells.filter(c => c.color === CellColor.GREEN);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setShowStats(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setShowStats(false);
    }
  }, [isAnimating]);

  if (!isAnimating) return null;

  const COLS = 5;
  const SPACING = 48;

  const calculateClusterPos = (index: number, color: CellColor) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    
    // 水平布局基准
    const baseX = color === CellColor.RED ? -240 : 240;
    // 动态计算堆叠区的 Y 轴起始位置，使阵列保持垂直居中感
    const groupCount = color === CellColor.RED ? redCells.length : greenCells.length;
    const rowsCount = Math.ceil(groupCount / COLS);
    const baseY = -((rowsCount * SPACING) / 2) + 24; 
    
    return {
      x: `calc(50% + ${baseX + col * SPACING}px)`,
      y: `calc(50% + ${baseY + row * SPACING}px)`,
    };
  };

  // 计算统计标签的 Y 轴位置，固定在阵列正上方 200px
  const getLabelYOffset = (count: number) => {
    const rowsCount = Math.ceil(count / COLS);
    const baseY = -((rowsCount * SPACING) / 2) + 24; 
    // 阵列顶部是 50% + baseY
    // 我们要在阵列顶部再往上 200px
    return `calc(50% + ${baseY - 200}px)`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950 flex items-center justify-center">
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(var(--rot)); }
          50% { transform: translate(-50%, -50%) translateY(-8px) rotate(var(--rot)); }
        }
        @keyframes arrival-pop {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-45deg); opacity: 0; }
          70% { transform: translate(-50%, -50%) scale(1.2) rotate(var(--rot)); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(var(--rot)); opacity: 1; }
        }
        .anim-cell {
          animation: arrival-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: var(--delay);
        }
        .anim-cell-settled {
          animation: float-gentle 4s ease-in-out infinite;
          animation-delay: calc(var(--delay) + 800ms);
        }
        .glow-pulse {
          animation: glow-pulse-kf 2s ease-in-out infinite;
        }
        @keyframes glow-pulse-kf {
          0%, 100% { filter: drop-shadow(0 0 10px var(--glow-color)); opacity: 0.8; }
          50% { filter: drop-shadow(0 0 25px var(--glow-color)); opacity: 1; }
        }
      `}</style>

      {/* 极简背景氛围 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute left-1/2 top-1/2 -translate-x-[300px] -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] transition-opacity duration-1000 ${showStats ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute left-1/2 top-1/2 translate-x-[0px] -translate-y-1/2 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-[140px] transition-opacity duration-1000 ${showStats ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>

      <div className="relative w-full h-full">
        {/* 渲染动态方块 */}
        {coloredCells.map((cell) => {
          const isRed = cell.color === CellColor.RED;
          const groupIndex = isRed ? redCells.findIndex(c => c.id === cell.id) : greenCells.findIndex(c => c.id === cell.id);
          const clusterPos = calculateClusterPos(groupIndex, cell.color);
          
          const delayMs = groupIndex * 35;
          const rotation = (groupIndex % 7) * 4 - 12; // 错落的旋转角度

          return (
            <div
              key={`anim-${cell.id}`}
              className={`fixed flex items-center justify-center text-[10px] font-black text-white rounded-lg border-2 border-white/20 shadow-2xl
                ${isRed ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-green-500 to-green-700'}
                ${showStats ? 'anim-cell-settled' : 'anim-cell'}`}
              style={{
                width: '44px',
                height: '44px',
                left: clusterPos.x,
                top: clusterPos.y,
                zIndex: 100 + groupIndex,
                // @ts-ignore
                '--delay': `${delayMs}ms`,
                '--rot': `${rotation}deg`,
                '--glow-color': isRed ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)'
              } as React.CSSProperties}
            >
              <span className="truncate px-0.5 drop-shadow-lg select-none">{cell.text || cell.row + 1}</span>
              {showStats && (
                <div className="absolute inset-0 rounded-lg opacity-30 bg-white/10 mix-blend-overlay"></div>
              )}
            </div>
          );
        })}

        {/* 红色统计标签 - 位于阵列上方 200px */}
        <div 
          className="absolute left-1/2 text-center pointer-events-none transition-all duration-1000 flex flex-col items-center"
          style={{ 
            opacity: showStats ? 1 : 0, 
            left: 'calc(50% - 144px)', // 红色阵列水平中心
            top: getLabelYOffset(redCells.length),
            transform: `translate(-50%, ${showStats ? '0' : '40px'})`
          }}
        >
          <div className="relative glow-pulse" style={{ '--glow-color': 'rgba(239, 68, 68, 0.5)' } as any}>
             <div className="text-red-500 font-black text-9xl tracking-tighter italic">
                {redCells.length}
             </div>
          </div>
          <div className="mt-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-black tracking-[0.5em] uppercase px-6 py-2 rounded-full backdrop-blur-xl shadow-2xl">
            RED DATA POINTS
          </div>
        </div>

        {/* 绿色统计标签 - 位于阵列上方 200px */}
        <div 
          className="absolute left-1/2 text-center pointer-events-none transition-all duration-1000 flex flex-col items-center"
          style={{ 
            opacity: showStats ? 1 : 0, 
            left: 'calc(50% + 336px)', // 绿色阵列水平中心
            top: getLabelYOffset(greenCells.length),
            transform: `translate(-50%, ${showStats ? '0' : '40px'})`
          }}
        >
          <div className="relative glow-pulse" style={{ '--glow-color': 'rgba(34, 197, 94, 0.5)' } as any}>
            <div className="text-green-500 font-black text-9xl tracking-tighter italic">
              {greenCells.length}
            </div>
          </div>
          <div className="mt-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[12px] font-black tracking-[0.5em] uppercase px-6 py-2 rounded-full backdrop-blur-xl shadow-2xl">
            GREEN DATA POINTS
          </div>
        </div>
      </div>

      {/* 底部退出按钮 */}
      <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 transition-all duration-1000 ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <button
          onClick={onClose}
          className="group relative px-14 py-5 bg-white text-slate-900 rounded-full font-black text-xl flex items-center gap-4 shadow-[0_30px_70px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-4 uppercase tracking-tighter">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transition-transform group-hover:-translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Restore Editor
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>

      {/* 背景动态装饰 */}
      <div className="absolute inset-0 border-[40px] border-white/[0.02] pointer-events-none"></div>
    </div>
  );
};

export default ColorStatsAnimator;
