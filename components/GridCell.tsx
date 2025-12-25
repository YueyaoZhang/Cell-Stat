
import React from 'react';
import { CellData, CellColor } from '../types';

interface GridCellProps {
  cell: CellData;
  onTextChange: (id: string, text: string) => void;
  onMouseEnter: () => void;
  onMouseDown: () => void;
  isAnimating: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ cell, onTextChange, onMouseEnter, onMouseDown, isAnimating }) => {
  const getBgColor = () => {
    switch (cell.color) {
      case CellColor.RED: return 'bg-red-500/80';
      case CellColor.GREEN: return 'bg-green-500/80';
      default: return 'bg-transparent';
    }
  };

  return (
    <div 
      className={`relative border-l border-slate-700/30 min-h-[38px] transition-all duration-300 ${getBgColor()} flex items-center group`}
      onMouseEnter={onMouseEnter}
      onMouseDown={onMouseDown}
    >
      <input
        type="text"
        value={cell.text}
        onChange={(e) => onTextChange(cell.id, e.target.value)}
        className="w-full h-full bg-transparent px-2 text-[13px] outline-none text-slate-100 placeholder-transparent focus:placeholder-slate-700/50 focus:bg-white/5 transition-all"
        placeholder={`${cell.row + 1}-${cell.col + 1}`}
        disabled={isAnimating}
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* 边角提示器 */}
      <div className={`absolute top-0 right-0 w-2 h-2 ${cell.color === CellColor.NONE ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        <div className={`w-full h-full ${cell.color === CellColor.RED ? 'bg-red-300' : 'bg-green-300'} clip-path-triangle opacity-40`}></div>
      </div>
      
      {/* 焦点边框 */}
      <div className="absolute inset-0 border-2 border-transparent group-focus-within:border-blue-500/50 pointer-events-none transition-all"></div>
    </div>
  );
};

export default GridCell;
