import { JournalHistoryView } from "@/features/journal/components/journal-history-view";
import { AppShell } from "@/shared/components/app-shell";

export default function JournalHistoryPage() {
  return (
    <AppShell
      eyebrow="지난 기록"
      title="남겨둔 마음들을 한 번에 돌아봐요"
      description="최근에 어떤 감정이 자주 머물렀는지, 조금씩 어떻게 달라졌는지 볼 수 있어요."
    >
      <JournalHistoryView />
    </AppShell>
  );
}
