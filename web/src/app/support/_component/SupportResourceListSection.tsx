import { AppIcon } from "@/shared/components/AppIcon";
import type { SupportResource } from "@/shared/lib/api";

export function SupportResourceListSection({
  primaryResource,
  resources,
  secondaryResources
}: {
  primaryResource?: SupportResource;
  resources: SupportResource[];
  secondaryResources: SupportResource[];
}) {
  return (
    <section className="mb-16 grid grid-cols-1 gap-6">
      {primaryResource ? (
        <div className="relative overflow-hidden rounded-xl bg-surfaceContainerLowest p-6 shadow-ambient">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondaryContainer/30 blur-2xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h3 className="mb-1 text-2xl text-secondary">{primaryResource.phone}</h3>
              <p className="mb-4 text-xs text-onSurfaceVariant">{primaryResource.title}</p>
            </div>
            <AppIcon name="support-agent" className="h-8 w-8 text-secondary/60" />
          </div>
          <a href={`tel:${primaryResource.phone}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-surfaceContainerLow py-3 text-sm text-secondary transition-colors duration-300 hover:bg-secondaryContainer">
            <AppIcon name="call" className="h-[18px] w-[18px]" />
            지금 연결하기
          </a>
        </div>
      ) : null}

      {resources.length === 0 ? (
        <div className="rounded-xl bg-surfaceContainerLowest p-5 shadow-ambient">
          <p className="text-sm leading-7 text-onSurfaceVariant">도움 정보를 불러오고 있어요.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        {secondaryResources.map((resource) => (
          <div key={resource.phone} className="flex flex-col justify-between rounded-xl bg-surfaceContainerLowest p-5 shadow-ambient">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <AppIcon
                  name={resource.phone === "119" ? "emergency" : "health-and-safety"}
                  className="h-5 w-5 text-primary/50"
                />
                <h3 className="text-xl text-primary">{resource.phone}</h3>
              </div>
              <p className="mb-4 text-[11px] leading-tight text-onSurfaceVariant">{resource.title}</p>
            </div>
            <a href={`tel:${resource.phone}`} className="flex w-max items-center gap-1 border-b border-primary/20 pb-1 text-left text-xs text-primary">
              통화 연결
              <AppIcon name="arrow-outward" className="h-[14px] w-[14px]" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
