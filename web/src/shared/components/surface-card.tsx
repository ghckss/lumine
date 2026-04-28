import { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <section
      className={`rounded-[26px] border border-line/70 bg-surfaceElevated px-5 py-5 shadow-[0_10px_30px_rgba(74,58,122,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}
