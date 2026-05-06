import { AppIcon } from "@/shared/components/AppIcon";

export function RecommendedActionsSection({ actions }: { actions: string[] }) {
  return (
    <section className="mb-16 ml-4 border-l border-surfaceContainerHigh pl-4 md:ml-4 md:pl-8">
      <h3 className="mb-6 text-xl tracking-wide text-primary">이런 시간을 보내면 어떨까요</h3>
      <ul className="space-y-6">
        {actions.map((action) => (
          <li key={action} className="flex items-start">
            <AppIcon name="auto-awesome" className="mr-4 mt-0.5 h-5 w-5 text-secondary/60" />
            <div>
              <p className="text-lg text-onSurface">{action}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
