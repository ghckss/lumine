export function JournalDetailStateSection({
  description,
  title
}: {
  description?: string;
  title: string;
}) {
  return (
    <section className="rounded-[1.5rem] bg-surfaceContainerLowest p-8 shadow-ambient">
      <p className="text-base leading-8 text-onSurface">{title}</p>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-onSurfaceVariant">{description}</p>
      ) : null}
    </section>
  );
}
