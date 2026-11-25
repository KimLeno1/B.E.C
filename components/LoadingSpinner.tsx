import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'sapphire' | 'gold' | 'white' | 'dark' | 'emerald';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
  labelPosition?: 'bottom' | 'right';
}

const sizeMap: Record<SpinnerSize, { ring: string; text: string }> = {
  xs: { ring: 'w-3.5 h-3.5 border-[1.5px]', text: 'text-[9px]' },
  sm: { ring: 'w-4 h-4 border-2', text: 'text-[10px]' },
  md: { ring: 'w-6 h-6 border-2', text: 'text-xs' },
  lg: { ring: 'w-8 h-8 border-[2.5px]', text: 'text-sm' },
  xl: { ring: 'w-12 h-12 border-3', text: 'text-base' },
};

const variantMap: Record<SpinnerVariant, { track: string; head: string; label: string }> = {
  sapphire: {
    track: 'border-[#4A2B18]/20',
    head: 'border-t-[#4A2B18] border-r-[#8C532B]',
    label: 'text-[#4A2B18]',
  },
  gold: {
    track: 'border-[#E5C9A8]/35',
    head: 'border-t-[#8C532B] border-r-[#E5C9A8]',
    label: 'text-[#8C532B]',
  },
  white: {
    track: 'border-white/20',
    head: 'border-t-white border-r-white',
    label: 'text-white',
  },
  dark: {
    track: 'border-[#EAD8C0]',
    head: 'border-t-[#3B2010] border-r-[#4A2B18]',
    label: 'text-[#3B2010]',
  },
  emerald: {
    track: 'border-emerald-500/20',
    head: 'border-t-emerald-600 border-r-emerald-500',
    label: 'text-emerald-600',
  },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'sapphire',
  className = '',
  label,
  labelPosition = 'right',
}) => {
  const { ring, text } = sizeMap[size];
  const { track, head, label: labelColor } = variantMap[variant];

  const spinnerElement = (
    <div
      role="status"
      aria-label={label || 'Loading...'}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
    >
      {/* Outer spinning ring */}
      <div
        className={`rounded-full animate-spin ${ring} ${track} ${head}`}
        style={{ animationDuration: '0.75s' }}
      />
      {/* Inner ambient pulse dot on medium and larger */}
      {(size === 'lg' || size === 'xl') && (
        <div
          className={`absolute w-1.5 h-1.5 rounded-full animate-ping opacity-60 ${
            variant === 'white' ? 'bg-white' : variant === 'gold' ? 'bg-[#E5C9A8]' : 'bg-[#4A2B18]'
          }`}
        />
      )}
    </div>
  );

  if (!label) {
    return spinnerElement;
  }

  return (
    <div
      className={`inline-flex items-center ${
        labelPosition === 'bottom' ? 'flex-col gap-2' : 'gap-2'
      }`}
    >
      {spinnerElement}
      <span
        className={`font-mono font-bold uppercase tracking-widest ${text} ${labelColor} animate-pulse`}
      >
        {label}
      </span>
    </div>
  );
};

export default LoadingSpinner;
