import type { FailureType, Severity } from '@/types/report';

export interface FailureOption {
  value: FailureType;
  label: string;
  description: string;
  icon: string;
  severity: Severity;
}

export const FAILURE_OPTIONS: FailureOption[] = [
  {
    value: 'POWER_OFF',
    label: 'Semáforo apagado',
    description: 'No emite ninguna señal.',
    icon: '🚦',
    severity: 'CRITICAL',
  },
  {
    value: 'YELLOW_FLASHING',
    label: 'Amarillo intermitente',
    description: 'Opera en modo de precaución.',
    icon: '🟡',
    severity: 'MEDIUM',
  },
  {
    value: 'RED_STUCK',
    label: 'Rojo permanente',
    description: 'La luz roja no cambia.',
    icon: '🔴',
    severity: 'HIGH',
  },
  {
    value: 'GREEN_STUCK',
    label: 'Verde permanente',
    description: 'La luz verde no cambia.',
    icon: '🟢',
    severity: 'HIGH',
  },
  {
    value: 'DAMAGED',
    label: 'Señal dañada',
    description: 'La estructura está averiada.',
    icon: '⚠️',
    severity: 'HIGH',
  },
  {
    value: 'ACCIDENT',
    label: 'Accidente',
    description: 'Siniestro que afecta la vía.',
    icon: '🚗',
    severity: 'CRITICAL',
  },
  {
    value: 'POTHOLE',
    label: 'Hueco en la vía',
    description: 'Daño visible en el pavimento.',
    icon: '🕳️',
    severity: 'MEDIUM',
  },
  {
    value: 'ROADWORK',
    label: 'Obra vial',
    description: 'Intervención u obstrucción temporal.',
    icon: '🚧',
    severity: 'MEDIUM',
  },
  {
    value: 'CONGESTION',
    label: 'Congestión',
    description: 'Tráfico detenido o muy lento.',
    icon: '🚙',
    severity: 'LOW',
  },
  {
    value: 'OTHER',
    label: 'Otro incidente',
    description: 'Situación de movilidad no listada.',
    icon: '📍',
    severity: 'LOW',
  },
];

export const STATUS_LABELS = {
  PENDING: 'Pendiente',
  VERIFIED: 'Verificado',
  IN_PROGRESS: 'En proceso',
  RESOLVED: 'Resuelto',
} as const;

export function getFailureOption(failureType: FailureType | null | undefined) {
  return FAILURE_OPTIONS.find((option) => option.value === failureType);
}
