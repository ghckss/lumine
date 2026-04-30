"use client";

type AppIconName =
  | "arrow-back"
  | "arrow-forward"
  | "arrow-outward"
  | "auto-awesome"
  | "call"
  | "close"
  | "emergency"
  | "health-and-safety"
  | "menu"
  | "schedule"
  | "support-agent";

type AppIconProps = {
  name: AppIconName;
  className?: string;
};

export function AppIcon({ name, className }: AppIconProps) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className
  };

  switch (name) {
    case "arrow-back":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      );
    case "arrow-forward":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );
    case "arrow-outward":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M7 17 17 7" />
          <path d="M9 7h8v8" />
        </svg>
      );
    case "auto-awesome":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
          <path d="m18.5 14 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
          <path d="m5.5 13 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
        </svg>
      );
    case "call":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M5 4h3l2 5-2 1.5a15 15 0 0 0 5 5L14.5 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 6.2 2 2 0 0 1 5 4Z" />
        </svg>
      );
    case "close":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="m6 6 12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );
    case "emergency":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M12 3 4 7v5c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V7l-8-4Z" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    case "health-and-safety":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M12 3 4 7v5c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V7l-8-4Z" />
          <path d="M12 9v6" />
          <path d="M9 12h6" />
        </svg>
      );
    case "menu":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    case "schedule":
      return (
        <svg {...commonProps} aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case "support-agent":
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M6 12a6 6 0 1 1 12 0" />
          <path d="M4 12v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Z" />
          <path d="M20 12v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
          <path d="M9 19h6" />
        </svg>
      );
  }
}
