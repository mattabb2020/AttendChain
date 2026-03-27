/** Default QR rotation period in seconds */
export const DEFAULT_QR_ROTATION_SEC = 30;

/** QR Secret used for HMAC signing (fallback for dev, must be set in production) */
export const QR_SECRET = process.env.QR_SECRET || "dev-qr-secret-change-me";

/** App base URL */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Error messages in Spanish */
export const ERRORS = {
  QR_INVALID: "El código QR no es válido. Escaneá de nuevo.",
  QR_EXPIRED: "El código QR expiró. Esperá al siguiente.",
  SESSION_NOT_FOUND: "No se encontró una clase en curso.",
  SESSION_ALREADY_OPEN:
    "Ya tenés una clase en curso. Finalizala antes de iniciar otra.",
  SESSION_CLOSED: "Esta clase ya fue finalizada.",
  NAME_REQUIRED: "Ingresá tu nombre para registrarte.",
  CLASS_TITLE_REQUIRED: "El título de la clase debe tener al menos 3 caracteres.",
  AUTH_REQUIRED: "Iniciá sesión para continuar.",
  CHECKIN_FAILED: "No se pudo registrar tu asistencia. Intentá de nuevo.",
  ONCHAIN_FAILED: "El registro on-chain falló, pero tu asistencia quedó guardada.",
  UNKNOWN: "Ocurrió un error inesperado.",
} as const;

/** Onchain status labels in Spanish */
export const STATUS_LABELS = {
  PENDING: "Pendiente",
  SUCCESS: "Confirmado",
  FAILED: "Fallido",
} as const;
