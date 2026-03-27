interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, className = "" }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <div className="px-6 pt-5 pb-3">
        <h3 className="text-sm font-headline font-bold text-on-surface">{title}</h3>
        {subtitle && (
          <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="px-6 pb-5">
        {children}
      </div>
    </div>
  );
}
