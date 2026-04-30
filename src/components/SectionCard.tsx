import type { ReactNode } from 'react';

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionCard({
  children,
  className = '',
}: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
