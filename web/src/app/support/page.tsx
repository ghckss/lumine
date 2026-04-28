import { SupportResourceList } from "@/features/support/components/support-resource-list";
import { AppShell } from "@/shared/components/app-shell";

export default function SupportPage() {
  return (
    <AppShell
      eyebrow="도움 연결"
      title="지금은 바로 닿는 도움을 먼저 붙잡아도 괜찮아요"
      description="혼자 버티는 쪽보다 연결되는 쪽이 더 나을 때가 있어요."
    >
      <SupportResourceList />
    </AppShell>
  );
}
