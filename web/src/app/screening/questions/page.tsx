import { ScreeningQuestionnaire } from "@/features/screening/components/screening-questionnaire";
import { AppShell } from "@/shared/components/app-shell";

export default function ScreeningQuestionsPage() {
  return (
    <AppShell
      eyebrow="마음 체크인"
      title="지금 떠오르는 쪽에 더 가까운 답을 골라봐요"
      description="조금 조심스러운 질문이 있어도 괜찮아요. 잠깐 멈췄다가 다시 이어가도 돼요."
    >
      <ScreeningQuestionnaire />
    </AppShell>
  );
}
