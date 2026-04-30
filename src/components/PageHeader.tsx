import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  centered?: boolean;
};

export default function PageHeader({
  title,
  subtitle,
  centered = false,
}: PageHeaderProps) {
  return (
    <header className={centered ? 'text-center' : ''}>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-gray-700">{subtitle}</p>
      )}
    </header>
  );
}
