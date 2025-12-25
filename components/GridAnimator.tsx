
import React, { useState, useEffect } from 'react';
import { CellData, CellColor } from '../types';

interface GridAnimatorProps {
  imageUrl: string;
  cells: CellData[];
  onReset: () => void;
}

const GridAnimator: React.FC<GridAnimatorProps> = ({ imageUrl, cells, onReset }) => {
  const [isClustered, setIsClustered] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate clustered positions
  const getClusteredPosition = (cell: CellData, index: number, totalInGroup: number, color: CellColor) => {
    const margin = 2; // px
    const cellSize = 30; // px for clustered view
    const cols = Math.ceil(Math.sqrt(totalInGroup));
    
    const rowIdx = Math.floor(index / cols);
    const colIdx = index % cols;

    // Red on left, Green on right
    const xOffset = color === CellColor.RED ? 10 : 60; // percentage
    
    return {
      x: xOffset + (colIdx * (cellSize + margin) / containerSize.width) * 100,
      y: 20 + (rowIdx * (cellSize + margin) / containerSize.height) * 100,
      w: (cellSize / containerSize.width) * 100,
      h: (cellSize / containerSize.height) * 100,
    };
  };

  const redCells = cells.filter(c => c.color === CellColor.RED);
  const greenCells = cells.filter(c => c.color === CellColor.GREEN);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setIsClustered(!isClustered)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all shadow-lg active:scale-95"
          >
            {isClustered ? "Restore Table" : "Gather Colored Cells"}
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all"
          >
            New Image
          </button>
        </div>
        <div className="text-sm text-slate-400">
          Detected: <span className="text-red-400 font-bold">{redCells.length} Red</span>, 
          <span className="text-green-400 font-bold ml-2">{greenCells.length} Green</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl"
      >
        {/* The Original Table Image */}
        <img 
          src={imageUrl} 
          alt="Excel Table" 
          className={`w-full h-full object-contain transition-opacity duration-1000 ${isClustered ? 'opacity-20' : 'opacity-100'}`}
        />

        {/* Overlay Animated Cells */}
        {cells.map((cell, idx) => {
          const colorGroup = cell.color === CellColor.RED ? redCells : greenCells;
          const groupIdx = colorGroup.findIndex(c => c.id === cell.id);
          const target = getClusteredPosition(cell, groupIdx, colorGroup.length, cell.color);

          const style: React.CSSProperties = {
            position: 'absolute',
            left: `${isClustered ? target.x : cell.x}%`,
            top: `${isClustered ? target.y : cell.y}%`,
            width: `${isClustered ? target.w : cell.width}%`,
            height: `${isClustered ? target.h : cell.height}%`,
            backgroundColor: cell.color === CellColor.RED ? '#ef4444' : '#22c55e',
            transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            boxShadow: isClustered ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
            borderRadius: isClustered ? '4px' : '0',
            zIndex: 10,
            opacity: 0.9,
          };

          return (
            <div key={cell.id} style={style}>
              {isClustered && (
                <div className="w-full h-full flex items-center justify-center text-[8px] text-white opacity-40">
                  {groupIdx + 1}
                </div>
              )}
            </div>
          );
        })}

        {/* Labels in Clustered View */}
        {isClustered && (
          <>
            <div 
              className="absolute top-[10%] left-[10%] text-red-400 font-bold text-xl animate-fade-in"
              style={{ transition: 'opacity 0.5s', opacity: isClustered ? 1 : 0 }}
            >
              RED GROUP
            </div>
            <div 
              className="absolute top-[10%] left-[60%] text-green-400 font-bold text-xl animate-fade-in"
              style={{ transition: 'opacity 0.5s', opacity: isClustered ? 1 : 0 }}
            >
              GREEN GROUP
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center">
               <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
               Red Insights
            </h4>
            <p className="text-sm text-slate-300">
               {isClustered ? `Identified ${redCells.length} critical data points requiring immediate attention.` : "Red cells usually represent outliers or missing values in Excel datasets."}
            </p>
         </div>
         <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h4 className="text-green-400 font-semibold mb-2 flex items-center">
               <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
               Green Insights
            </h4>
            <p className="text-sm text-slate-300">
               {isClustered ? `Clustered ${greenCells.length} successful records for performance comparison.` : "Green cells indicate successful operations or values within the target range."}
            </p>
         </div>
      </div>
    </div>
  );
};

export default GridAnimator;
