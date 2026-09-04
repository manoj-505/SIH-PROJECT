import React, { useState } from 'react';
import { Delete, CornerDownLeft, Space, X } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClose,
  isOpen = true
}) => {
  const [isCaps, setIsCaps] = useState<boolean>(false);
  const [mode, setMode] = useState<'alpha' | 'num'>('alpha');

  if (!isOpen) return null;

  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const numRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const numRow2 = ['-', '/', ':', ';', '(', ')', '₹', '&', '@', '"'];
  const numRow3 = ['.', ',', '?', '!', '\'', '+', '=', '*', '%'];

  return (
    <div className="w-full bg-slate-900 border-t-2 border-primary-500/40 p-3 sm:p-4 shadow-2xl rounded-t-3xl select-none z-30 animate-in slide-in-from-bottom duration-200">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        
        {/* Top helper bar */}
        <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Kiosk Touch Keyboard
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode(mode === 'alpha' ? 'num' : 'alpha')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-primary-400 hover:bg-slate-700 font-bold"
            >
              {mode === 'alpha' ? '123 / Symbols' : 'ABC'}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Row 1 */}
        <div className="flex justify-center gap-1.5">
          {(mode === 'alpha' ? row1 : numRow1).map((key) => {
            const letter = isCaps ? key.toUpperCase() : key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onKeyPress(letter)}
                className="kiosk-btn flex-1 h-12 rounded-xl bg-slate-800 text-white font-semibold text-lg hover:bg-slate-700 active:bg-primary-600 border border-slate-700 shadow-sm flex items-center justify-center"
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="flex justify-center gap-1.5 px-3">
          {(mode === 'alpha' ? row2 : numRow2).map((key) => {
            const letter = isCaps ? key.toUpperCase() : key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onKeyPress(letter)}
                className="kiosk-btn flex-1 h-12 rounded-xl bg-slate-800 text-white font-semibold text-lg hover:bg-slate-700 active:bg-primary-600 border border-slate-700 shadow-sm flex items-center justify-center"
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Row 3 */}
        <div className="flex justify-center gap-1.5">
          {mode === 'alpha' && (
            <button
              type="button"
              onClick={() => setIsCaps(!isCaps)}
              className={`kiosk-btn px-4 h-12 rounded-xl text-xs font-bold border flex items-center justify-center transition-colors ${
                isCaps
                  ? 'bg-primary-600 text-white border-primary-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              CAPS
            </button>
          )}

          {(mode === 'alpha' ? row3 : numRow3).map((key) => {
            const letter = isCaps ? key.toUpperCase() : key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onKeyPress(letter)}
                className="kiosk-btn flex-1 h-12 rounded-xl bg-slate-800 text-white font-semibold text-lg hover:bg-slate-700 active:bg-primary-600 border border-slate-700 shadow-sm flex items-center justify-center"
              >
                {letter}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onBackspace}
            className="kiosk-btn px-4 h-12 rounded-xl bg-rose-900/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/70 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Row 4 (Space & Done) */}
        <div className="flex justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onKeyPress(' ')}
            className="kiosk-btn flex-[3] h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-primary-600 text-slate-300 text-sm font-semibold border border-slate-700 flex items-center justify-center gap-2"
          >
            <Space className="w-5 h-5" />
            <span>Space</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="kiosk-btn flex-[1] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <CornerDownLeft className="w-4 h-4" />
              <span>Done</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
