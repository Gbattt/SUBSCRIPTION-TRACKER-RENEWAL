import React from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

export default function UndoToast({ toastState, onUndo, onClose }) {
  if (!toastState || !toastState.show) return null;

  const itemName = toastState.item ? toastState.item.name : 'Subscription';

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center animate-bounce-short">
      <div className="bg-zinc-900 border border-zinc-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 max-w-md w-full sm:w-auto backdrop-blur-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-sm font-medium text-zinc-200">
            <strong className="text-white font-bold">{itemName}</strong> removed
          </span>
        </div>

        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Undo removal of ${itemName}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Undo
        </button>
      </div>

      {/* 5-second progress indicator bar */}
      <div className="w-full bg-zinc-800 h-1 rounded-b-xl overflow-hidden mt-0.5">
        <div className="bg-red-600 h-full animate-shrink-width" style={{ animationDuration: '5000ms' }} />
      </div>
    </div>
  );
}
