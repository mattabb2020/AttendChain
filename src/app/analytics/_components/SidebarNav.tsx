"use client";

export type Tab = "overview" | "advisor" | "course" | "student";

interface SidebarNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Vista General", icon: "dashboard" },
  { id: "advisor", label: "Asesor Academico", icon: "support_agent" },
  { id: "course", label: "Salud del Curso", icon: "school" },
  { id: "student", label: "Perfil Estudiante", icon: "person_search" },
];

export default function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <div>
              <h1 className="text-base font-headline font-bold tracking-tight">AttendChain</h1>
              <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest">Analytics</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 text-white shadow-lg shadow-primary/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${isActive ? "text-primary-fixed-dim" : ""}`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                {tab.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-fixed-dim" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo badge */}
        <div className="px-4 pb-6">
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-amber-400 text-sm">science</span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Modo Demo</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Datos ficticios generados para demostración. No representan estudiantes reales.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile top tabs */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-700/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>
          <h1 className="text-sm font-headline font-bold text-white">AttendChain Analytics</h1>
          <div className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Demo</span>
          </div>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary/20 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
