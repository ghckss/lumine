"use client";

function SurfaceCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[28px] bg-surfaceContainerLowest px-5 py-5 shadow-ambient ${className}`}>{children}</section>;
}

export function JournalBodySection({
  body,
  bodyNotice,
  onBodyChange
}: {
  body: string;
  bodyNotice: string | null;
  onBodyChange: (value: string) => void;
}) {
  return (
    <SurfaceCard>
      <h3 className="text-[1.55rem] leading-[1.45] text-onSurface">오늘 있었던 일을 남겨봐요</h3>
      <textarea
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        className={`mt-5 min-h-56 w-full rounded-[24px] border px-4 py-4 text-base outline-none placeholder:text-onSurfaceVariant/70 ${
          bodyNotice
            ? "border-error/50 bg-errorContainer/40 text-onSurface"
            : "border-outlineVariant/30 bg-surfaceContainerLow"
        }`}
        placeholder="오늘은 어떤 일이 있으셨나요? 저에게만 알려주세요."
      />
      {bodyNotice ? (
        <p className="mt-3 text-sm text-error">{bodyNotice}</p>
      ) : null}
    </SurfaceCard>
  );
}
