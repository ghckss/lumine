"use client";

export function ComfortOverlay({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 px-6 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[28px] bg-surfaceContainerLowest px-6 py-8 text-center shadow-moon">
        <p className="text-[1.3rem] leading-[1.7] text-onSurface">{message}</p>
      </div>
    </div>
  );
}
