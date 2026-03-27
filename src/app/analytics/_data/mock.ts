// ─── Types ──────────────────────────────────────────────

export interface KpiCard {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: string;
  color: string;
  sparkline: number[];
}

export interface RetentionPoint {
  mes: string;
  tasa: number;
}

export interface DfwCourse {
  curso: string;
  tasa: number;
}

export interface RiskStudent {
  id: string;
  nombre: string;
  score: number;
  band: "ALTO" | "MEDIO" | "OBSERVAR";
  razones: { label: string; category: "asistencia" | "notas" | "actividad" | "entregas" }[];
  curso: string;
  ultimaActividad: string;
  casoEstado: "abierto" | "pendiente" | "sin_caso";
}

export interface GradeBar {
  rango: string;
  cantidad: number;
  color: string;
}

export interface WeeklyActivity {
  semana: string;
  activos: number;
  inactivos: number;
}

export interface HeatmapCell {
  dia: string;
  hora: string;
  tasa: number;
}

export interface RiskFactor {
  feature: string;
  value: number;
  direction: "bajo" | "alto";
  label: string;
}

export interface TimelineEvent {
  fecha: string;
  tipo: "asistencia" | "nota" | "caso" | "actividad" | "alerta";
  descripcion: string;
  icono: string;
}

export interface MissingAssignment {
  materia: string;
  tarea: string;
  vencimiento: string;
  estudiante: string;
}

// ─── KPI Cards ──────────────────────────────────────────

export const kpis: KpiCard[] = [
  {
    label: "Tasa de Persistencia",
    value: "78,3%",
    delta: "+2,1%",
    trend: "up",
    icon: "trending_up",
    color: "#004ac6",
    sparkline: [72, 73, 74, 73, 75, 76, 75, 77, 76, 78, 77, 78.3],
  },
  {
    label: "Tasa DFW",
    value: "12,1%",
    delta: "-1,4%",
    trend: "down",
    icon: "warning",
    color: "#ab0b1c",
    sparkline: [16, 15.5, 14.8, 14, 13.5, 13.2, 13, 12.8, 12.5, 12.3, 12.2, 12.1],
  },
  {
    label: "Asistencia Promedio",
    value: "84,7%",
    delta: "+3,2%",
    trend: "up",
    icon: "groups",
    color: "#006c49",
    sparkline: [78, 79, 80, 81, 82, 81, 83, 84, 83, 84, 85, 84.7],
  },
  {
    label: "Casos Activos",
    value: "24",
    delta: "+6",
    trend: "up",
    icon: "assignment_late",
    color: "#b45309",
    sparkline: [12, 14, 15, 16, 18, 17, 19, 20, 21, 22, 23, 24],
  },
];

// ─── Retention Trend (12 months) ────────────────────────

export const retentionTrend: RetentionPoint[] = [
  { mes: "Abr 25", tasa: 82.1 },
  { mes: "May 25", tasa: 81.5 },
  { mes: "Jun 25", tasa: 80.8 },
  { mes: "Jul 25", tasa: 80.2 },
  { mes: "Ago 25", tasa: 79.5 },
  { mes: "Sep 25", tasa: 79.1 },
  { mes: "Oct 25", tasa: 78.8 },
  { mes: "Nov 25", tasa: 78.4 },
  { mes: "Dic 25", tasa: 78.0 },
  { mes: "Ene 26", tasa: 78.2 },
  { mes: "Feb 26", tasa: 78.1 },
  { mes: "Mar 26", tasa: 78.3 },
];

// ─── DFW Hotspots ───────────────────────────────────────

export const dfwHotspots: DfwCourse[] = [
  { curso: "Algebra II", tasa: 28.4 },
  { curso: "Fisica I", tasa: 24.1 },
  { curso: "Quimica General", tasa: 21.7 },
  { curso: "Analisis Matematico I", tasa: 19.3 },
  { curso: "Programacion I", tasa: 16.8 },
  { curso: "Estadistica", tasa: 14.2 },
  { curso: "Intro. a la Economia", tasa: 11.5 },
  { curso: "Historia Arg. II", tasa: 8.9 },
];

// ─── At-Risk Donut ──────────────────────────────────────

export const atRiskCounts = [
  { name: "Alto", value: 24, color: "#ab0b1c" },
  { name: "Medio", value: 47, color: "#b45309" },
  { name: "Observar", value: 63, color: "#ca8a04" },
  { name: "Normal", value: 366, color: "#006c49" },
];

// ─── Risk Queue (Advisor) ───────────────────────────────

export const riskQueue: RiskStudent[] = [
  {
    id: "stu_0001",
    nombre: "Martinez, Lucia",
    score: 89,
    band: "ALTO",
    razones: [
      { label: "4 inasistencias consecutivas", category: "asistencia" },
      { label: "3 tareas pendientes", category: "entregas" },
    ],
    curso: "Algebra II",
    ultimaActividad: "Hace 8 dias",
    casoEstado: "abierto",
  },
  {
    id: "stu_0002",
    nombre: "Gonzalez, Santiago",
    score: 85,
    band: "ALTO",
    razones: [
      { label: "Asistencia 14d: 38%", category: "asistencia" },
      { label: "Nota en caida: -15pts", category: "notas" },
    ],
    curso: "Fisica I",
    ultimaActividad: "Hace 5 dias",
    casoEstado: "pendiente",
  },
  {
    id: "stu_0003",
    nombre: "Rodriguez, Valentina",
    score: 82,
    band: "ALTO",
    razones: [
      { label: "Sin actividad LMS 12 dias", category: "actividad" },
      { label: "2 tareas sin entregar", category: "entregas" },
    ],
    curso: "Quimica General",
    ultimaActividad: "Hace 12 dias",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0004",
    nombre: "Lopez, Mateo",
    score: 78,
    band: "ALTO",
    razones: [
      { label: "Asistencia 14d: 42%", category: "asistencia" },
      { label: "Actividad LMS: percentil 8", category: "actividad" },
    ],
    curso: "Analisis Matematico I",
    ultimaActividad: "Hace 6 dias",
    casoEstado: "abierto",
  },
  {
    id: "stu_0005",
    nombre: "Fernandez, Camila",
    score: 74,
    band: "ALTO",
    razones: [
      { label: "3 inasistencias consecutivas", category: "asistencia" },
      { label: "Nota actual: 3,2/10", category: "notas" },
    ],
    curso: "Programacion I",
    ultimaActividad: "Hace 3 dias",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0006",
    nombre: "Diaz, Tomas",
    score: 68,
    band: "MEDIO",
    razones: [
      { label: "Asistencia 14d: 57%", category: "asistencia" },
      { label: "1 tarea pendiente", category: "entregas" },
    ],
    curso: "Estadistica",
    ultimaActividad: "Hace 2 dias",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0007",
    nombre: "Alvarez, Martina",
    score: 65,
    band: "MEDIO",
    razones: [
      { label: "Nota en caida: -10pts", category: "notas" },
      { label: "Actividad LMS: percentil 22", category: "actividad" },
    ],
    curso: "Algebra II",
    ultimaActividad: "Hace 1 dia",
    casoEstado: "pendiente",
  },
  {
    id: "stu_0008",
    nombre: "Romero, Joaquin",
    score: 62,
    band: "MEDIO",
    razones: [
      { label: "2 inasistencias consecutivas", category: "asistencia" },
      { label: "Actividad LMS: percentil 18", category: "actividad" },
    ],
    curso: "Fisica I",
    ultimaActividad: "Hace 4 dias",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0009",
    nombre: "Torres, Sofia",
    score: 58,
    band: "MEDIO",
    razones: [
      { label: "1 tarea sin entregar", category: "entregas" },
      { label: "Nota en caida: -8pts", category: "notas" },
    ],
    curso: "Intro. a la Economia",
    ultimaActividad: "Hace 1 dia",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0010",
    nombre: "Morales, Benjamin",
    score: 55,
    band: "MEDIO",
    razones: [
      { label: "Asistencia 14d: 62%", category: "asistencia" },
    ],
    curso: "Quimica General",
    ultimaActividad: "Hoy",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0011",
    nombre: "Gutierrez, Mia",
    score: 48,
    band: "OBSERVAR",
    razones: [
      { label: "Actividad LMS: percentil 30", category: "actividad" },
    ],
    curso: "Programacion I",
    ultimaActividad: "Hoy",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0012",
    nombre: "Sanchez, Nicolas",
    score: 44,
    band: "OBSERVAR",
    razones: [
      { label: "Nota en caida: -6pts", category: "notas" },
    ],
    curso: "Historia Arg. II",
    ultimaActividad: "Ayer",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0013",
    nombre: "Ramirez, Isabella",
    score: 41,
    band: "OBSERVAR",
    razones: [
      { label: "Asistencia 14d: 71%", category: "asistencia" },
    ],
    curso: "Estadistica",
    ultimaActividad: "Hoy",
    casoEstado: "sin_caso",
  },
  {
    id: "stu_0014",
    nombre: "Flores, Lautaro",
    score: 38,
    band: "OBSERVAR",
    razones: [
      { label: "1 entrega tardia reciente", category: "entregas" },
    ],
    curso: "Analisis Matematico I",
    ultimaActividad: "Hoy",
    casoEstado: "sin_caso",
  },
];

// ─── Advisor Summary Cards ──────────────────────────────

export const advisorSummary = {
  casosAbiertos: 18,
  altaPrioridad: 5,
  vencimientosSla: 3,
};

// ─── Grade Distribution ─────────────────────────────────

export const gradeDistribution: GradeBar[] = [
  { rango: "10-9", cantidad: 8, color: "#006c49" },
  { rango: "8-7", cantidad: 14, color: "#16a34a" },
  { rango: "6-5", cantidad: 11, color: "#ca8a04" },
  { rango: "4-3", cantidad: 6, color: "#ea580c" },
  { rango: "2-1", cantidad: 3, color: "#ab0b1c" },
];

// ─── Weekly Activity ────────────────────────────────────

export const weeklyActivity: WeeklyActivity[] = [
  { semana: "Sem 1", activos: 38, inactivos: 4 },
  { semana: "Sem 2", activos: 36, inactivos: 6 },
  { semana: "Sem 3", activos: 35, inactivos: 7 },
  { semana: "Sem 4", activos: 33, inactivos: 9 },
  { semana: "Sem 5", activos: 34, inactivos: 8 },
  { semana: "Sem 6", activos: 31, inactivos: 11 },
  { semana: "Sem 7", activos: 30, inactivos: 12 },
  { semana: "Sem 8", activos: 29, inactivos: 13 },
];

// ─── Attendance Heatmap ─────────────────────────────────

const dias = ["Lun", "Mar", "Mie", "Jue", "Vie"];
const horas = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

export const attendanceHeatmap: HeatmapCell[] = dias.flatMap((dia) =>
  horas.map((hora) => ({
    dia,
    hora,
    tasa: (() => {
      // Realistic patterns: lower on Fridays, lower at 08:00
      const base = 0.82;
      const fridayPenalty = dia === "Vie" ? -0.12 : 0;
      const earlyPenalty = hora === "08:00" ? -0.10 : hora === "16:00" ? -0.06 : 0;
      const afternoonPenalty = hora === "14:00" ? -0.04 : 0;
      const noise = (Math.sin(dias.indexOf(dia) * 3 + horas.indexOf(hora) * 7) * 0.08);
      return Math.max(0.45, Math.min(0.98, base + fridayPenalty + earlyPenalty + afternoonPenalty + noise));
    })(),
  }))
);

export const heatmapDias = dias;
export const heatmapHoras = horas;

// ─── Missing Assignments ────────────────────────────────

export const missingAssignments: MissingAssignment[] = [
  { materia: "Algebra II", tarea: "TP 4 - Matrices", vencimiento: "22/03/2026", estudiante: "Martinez, Lucia" },
  { materia: "Algebra II", tarea: "Ejercicios Cap. 6", vencimiento: "24/03/2026", estudiante: "Martinez, Lucia" },
  { materia: "Algebra II", tarea: "TP 4 - Matrices", vencimiento: "22/03/2026", estudiante: "Alvarez, Martina" },
  { materia: "Algebra II", tarea: "Quiz Semana 7", vencimiento: "25/03/2026", estudiante: "Gonzalez, Santiago" },
  { materia: "Algebra II", tarea: "TP 4 - Matrices", vencimiento: "22/03/2026", estudiante: "Lopez, Mateo" },
];

// ─── Course Health Flagged Students ─────────────────────

export const courseStudents = [
  { nombre: "Martinez, Lucia", asistencia: 42, nota: 3.2, score: 89, band: "ALTO" as const },
  { nombre: "Alvarez, Martina", asistencia: 65, nota: 4.8, score: 65, band: "MEDIO" as const },
  { nombre: "Lopez, Mateo", asistencia: 48, nota: 3.8, score: 78, band: "ALTO" as const },
  { nombre: "Sanchez, Nicolas", asistencia: 74, nota: 5.1, score: 44, band: "OBSERVAR" as const },
];

// ─── Student Profile (detail) ───────────────────────────

export const studentProfile = {
  id: "stu_0003",
  nombre: "Rodriguez, Valentina",
  programa: "Ingenieria Industrial",
  cohorte: 2024,
  modalidad: "Presencial",
  score: 82,
  band: "ALTO" as const,
  cursos: [
    { nombre: "Quimica General", nota: 3.8, asistencia: 52 },
    { nombre: "Algebra II", nota: 5.2, asistencia: 68 },
    { nombre: "Fisica I", nota: 4.1, asistencia: 61 },
  ],
};

export const studentRiskFactors: RiskFactor[] = [
  { feature: "Asistencia 14d", value: 0.85, direction: "bajo", label: "52%" },
  { feature: "Tareas pendientes", value: 0.65, direction: "alto", label: "3 tareas" },
  { feature: "Actividad LMS", value: 0.55, direction: "bajo", label: "Percentil 12" },
  { feature: "Tendencia de nota", value: 0.45, direction: "bajo", label: "-12 pts" },
  { feature: "Racha ausencias", value: 0.40, direction: "alto", label: "4 consecutivas" },
];

export const studentTimeline: TimelineEvent[] = [
  { fecha: "27/03/2026", tipo: "alerta", descripcion: "Alerta automatica: riesgo alto detectado", icono: "notification_important" },
  { fecha: "26/03/2026", tipo: "caso", descripcion: "Caso abierto por Lic. Moreno — motivo: inasistencias reiteradas", icono: "folder_open" },
  { fecha: "25/03/2026", tipo: "asistencia", descripcion: "Ausente — Quimica General (14:00)", icono: "event_busy" },
  { fecha: "24/03/2026", tipo: "asistencia", descripcion: "Ausente — Algebra II (10:00)", icono: "event_busy" },
  { fecha: "23/03/2026", tipo: "nota", descripcion: "Parcial Fisica I: 4,1 / 10 (promedio del curso: 6,3)", icono: "assignment" },
  { fecha: "21/03/2026", tipo: "asistencia", descripcion: "Ausente — Quimica General (14:00)", icono: "event_busy" },
  { fecha: "20/03/2026", tipo: "asistencia", descripcion: "Ausente — Fisica I (08:00)", icono: "event_busy" },
  { fecha: "18/03/2026", tipo: "actividad", descripcion: "Ultimo acceso al campus virtual", icono: "computer" },
  { fecha: "15/03/2026", tipo: "asistencia", descripcion: "Presente — Algebra II (10:00)", icono: "event_available" },
  { fecha: "14/03/2026", tipo: "nota", descripcion: "TP 3 Quimica General: 5,0 / 10", icono: "assignment" },
  { fecha: "12/03/2026", tipo: "caso", descripcion: "Contacto por email — sin respuesta", icono: "mail" },
  { fecha: "10/03/2026", tipo: "asistencia", descripcion: "Presente — Quimica General (14:00)", icono: "event_available" },
];

export const studentCases = [
  {
    id: "CASO-2026-0087",
    estado: "Abierto",
    abiertoPor: "Lic. Moreno",
    fecha: "26/03/2026",
    motivo: "Inasistencias reiteradas y caida de rendimiento",
    acciones: [
      { fecha: "26/03/2026", accion: "Caso creado — asignado a Lic. Moreno" },
      { fecha: "27/03/2026", accion: "Intento de contacto por email (pendiente respuesta)" },
    ],
    slaVence: "28/03/2026",
  },
];

// ─── Attendance Trend by Week ───────────────────────────

export const attendanceTrend = [
  { semana: "Sem 1", tasa: 91.2 },
  { semana: "Sem 2", tasa: 89.5 },
  { semana: "Sem 3", tasa: 87.8 },
  { semana: "Sem 4", tasa: 86.1 },
  { semana: "Sem 5", tasa: 85.3 },
  { semana: "Sem 6", tasa: 84.0 },
  { semana: "Sem 7", tasa: 83.5 },
  { semana: "Sem 8", tasa: 84.7 },
];
