import type { ReactNode } from 'react';

type StatusTone = 'error' | 'muted';

type StatusMessageProps = {
  children: ReactNode;
  tone?: StatusTone;
  live?: 'polite' | 'assertive';
  className?: string;
};

const TONE_STYLES: Record<StatusTone, string> = {
  error: 'text-red-700',
  muted: 'text-gray-700',
};

export default function StatusMessage({
  children,
  tone = 'muted',
  live,
  className = '',
}: StatusMessageProps) {
  return (
    <p
      aria-live={live}
      className={`${TONE_STYLES[tone]} text-sm ${className}`.trim()}
    >
      {children}
    </p>
  );
}
