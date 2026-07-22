import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  className = '',
  readOnly,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-300 uppercase px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-slate-400 text-lg pointer-events-none">
            {icon}
          </div>
        )}
        <input
          readOnly={readOnly}
          style={{
            color: 'var(--tg-text-color, #f8fafc)'
          }}
          className={`w-full rounded-2xl py-3 px-4 ${
            icon ? 'pl-11' : 'pl-4'
          } text-sm font-medium transition-all duration-200 outline-none border ${
            readOnly
              ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              : error
              ? 'border-rose-500/80 bg-rose-500/10 focus:ring-2 focus:ring-rose-500/30'
              : 'border-slate-200 dark:border-slate-700/60 bg-white/85 dark:bg-slate-900/60 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400 px-1 font-medium">{error}</span>}
      {!error && helperText && (
        <span className="text-[11px] text-slate-400 px-1">{helperText}</span>
      )}
    </div>
  );
};
