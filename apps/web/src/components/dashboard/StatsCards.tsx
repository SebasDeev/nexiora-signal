import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
} from "lucide-react";

import type { Report } from "@/types/report";

interface Props {
  reports: Report[];
}

export function StatsCards({ reports }: Props) {
  const total = reports.length;

  const pending = reports.filter(
    (r) => r.status === "PENDING"
  ).length;

  const progress = reports.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;

  const resolved = reports.filter(
    (r) => r.status === "RESOLVED"
  ).length;

  const items = [
    {
      label: "Reportes",
      value: total,
      icon: FileWarning,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pendientes",
      value: pending,
      icon: AlertTriangle,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Proceso",
      value: progress,
      icon: Clock3,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
    },
    {
      label: "Resueltos",
      value: resolved,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section
      className="
        grid
        grid-cols-2
        gap-4
        xl:grid-cols-4
      "
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="
              flex
              items-center
              justify-between
              rounded-3xl
              border
              border-slate-200
              bg-white
              px-6
              py-5
              shadow-sm
              transition
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            <div>

              <p className="text-sm text-slate-500">
                {item.label}
              </p>

              <h2 className="mt-2 text-5xl font-black text-slate-900">
                {item.value}
              </h2>

            </div>

            <div
              className={`
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                ${item.bg}
              `}
            >
              <Icon
                className={item.color}
                size={30}
              />
            </div>

          </article>
        );
      })}
    </section>
  );
}