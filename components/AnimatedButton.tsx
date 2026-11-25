import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { LoadingSpinner, SpinnerVariant } from './LoadingSpinner';
import { triggerGlobalLoading } from '../lib/loading';

export type ButtonVariant = 'sapphire' | 'primary' | 'gold' | 'outline' | 'ghost' | 'emerald' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'onClick'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  successText?: string;
  isSuccess?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { base: string; spinnerVariant: SpinnerVariant }> = {
  sapphire: {
    base: 'bg-gradient-to-r from-[#4A2B18] to-[#3B2010] text-[#FAF4EC] border border-[#E5C9A8]/35 shadow-md hover:shadow-[0_4px_20px_rgba(74,43,24,0.35)] hover:border-[#E5C9A8]/60',
    spinnerVariant: 'white',
  },
  primary: {
    base: 'bg-[#3B2010] text-[#FAF4EC] border border-[#4A2B18] shadow-md hover:bg-[#261409] hover:border-[#8C532B]',
    spinnerVariant: 'white',
  },
  gold: {
    base: 'bg-gradient-to-r from-[#8C532B] to-[#5A331C] text-[#FAF4EC] border border-[#E5C9A8]/45 shadow-md hover:shadow-[0_4px_20px_rgba(140,83,43,0.35)]',
    spinnerVariant: 'white',
  },
  outline: {
    base: 'bg-[#FAF4EC] text-[#3B2010] border border-[#EAD8C0] hover:border-[#8C532B] hover:bg-[#F5EAD8] shadow-xs',
    spinnerVariant: 'dark',
  },
  ghost: {
    base: 'bg-transparent text-[#4A2B18] hover:bg-[#F5EAD8]/80 border border-transparent',
    spinnerVariant: 'dark',
  },
  emerald: {
    base: 'bg-emerald-600 text-white border border-emerald-500 shadow-md hover:bg-emerald-700',
    spinnerVariant: 'white',
  },
  danger: {
    base: 'bg-red-600 text-white border border-red-500 shadow-md hover:bg-red-700',
    spinnerVariant: 'white',
  },
};

const sizeStyles: Record<ButtonSize, { padding: string; text: string; spinnerSize: 'xs' | 'sm' | 'md' }> = {
  xs: { padding: 'px-2.5 py-1.5 rounded-lg', text: 'text-[9px]', spinnerSize: 'xs' },
  sm: { padding: 'px-3.5 py-2 rounded-xl', text: 'text-[10px]', spinnerSize: 'xs' },
  md: { padding: 'px-5 py-3 rounded-2xl', text: 'text-xs', spinnerSize: 'sm' },
  lg: { padding: 'px-7 py-4 rounded-2xl', text: 'text-sm', spinnerSize: 'md' },
  xl: { padding: 'px-8 py-5 rounded-3xl', text: 'text-base', spinnerSize: 'md' },
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading: controlledLoading,
  loadingText,
  successText,
  isSuccess = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [showBriefSuccess, setShowBriefSuccess] = useState(false);

  const loading = controlledLoading ?? internalLoading;
  const { base, spinnerVariant } = variantStyles[variant];
  const { padding, text, spinnerSize } = sizeStyles[size];

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled || isSuccess) return;
    triggerGlobalLoading(600);

    if (onClick) {
      const result = onClick(e);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        try {
          setInternalLoading(true);
          await result;
          if (successText) {
            setShowBriefSuccess(true);
            setTimeout(() => setShowBriefSuccess(false), 1500);
          }
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  const isCurrentSuccess = isSuccess || showBriefSuccess;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-black uppercase tracking-wider overflow-hidden cursor-pointer select-none transition-colors duration-200 ${padding} ${text} ${base} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : ''} ${className}`}
      {...rest}
    >
      {/* Animated Loading Shimmer bar when loading */}
      {loading && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      )}

      {/* Content wrapper */}
      <div className="inline-flex items-center justify-center gap-2 relative z-10 whitespace-nowrap">
        {loading ? (
          <>
            <LoadingSpinner size={spinnerSize} variant={spinnerVariant} />
            {loadingText && (
              <span className="font-mono tracking-widest">{loadingText}</span>
            )}
            {!loadingText && children}
          </>
        ) : isCurrentSuccess ? (
          <>
            <span className="inline-block animate-bounce">✓</span>
            <span>{successText || 'Done'}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="shrink-0">{icon}</span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="shrink-0">{icon}</span>
            )}
          </>
        )}
      </div>
    </motion.button>
  );
};

export default AnimatedButton;
