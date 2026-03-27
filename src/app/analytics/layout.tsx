import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — AttendChain",
  description: "Dashboard universitario de riesgo de deserción y KPIs académicos",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
