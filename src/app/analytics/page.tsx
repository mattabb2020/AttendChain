"use client";

import { useState } from "react";
import SidebarNav, { type Tab } from "./_components/SidebarNav";
import OverviewView from "./_views/OverviewView";
import AdvisorView from "./_views/AdvisorView";
import CourseHealthView from "./_views/CourseHealthView";
import StudentProfileView from "./_views/StudentProfileView";

const tabTitles: Record<Tab, { title: string; subtitle: string }> = {
  overview: { title: "Vista General", subtitle: "KPIs academicos y panorama de riesgo institucional" },
  advisor: { title: "Asesor Academico", subtitle: "Cola de riesgo y gestion de casos estudiantiles" },
  course: { title: "Salud del Curso", subtitle: "Metricas de rendimiento por seccion" },
  student: { title: "Perfil Estudiante", subtitle: "Detalle de riesgo y linea de tiempo individual" },
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { title, subtitle } = tabTitles[activeTab];

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content area */}
      <main className="lg:ml-64 min-h-screen">
        {/* Gradient accent line */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 mt-[88px] lg:mt-0">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">{title}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-on-surface">Dr. Martinez</p>
                <p className="text-[11px] text-on-surface-variant">Direccion Academica</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-headline font-bold text-sm">
                DM
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-7xl mx-auto" key={activeTab}>
          {activeTab === "overview" && <OverviewView />}
          {activeTab === "advisor" && <AdvisorView />}
          {activeTab === "course" && <CourseHealthView />}
          {activeTab === "student" && <StudentProfileView />}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 text-center border-t border-gray-100 bg-white">
          <p className="text-[11px] text-on-surface-variant">
            AttendChain Analytics &middot; Dashboard de demostración con datos ficticios &middot; La Vendimia Tech 2026
          </p>
        </footer>
      </main>
    </>
  );
}
