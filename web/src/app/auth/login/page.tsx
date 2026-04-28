import { LoginOptions } from "@/features/auth/components/login-options";
import { AppShell } from "@/shared/components/app-shell";

export default function LoginPage() {
  return (
    <AppShell
      eyebrow="안녕하세요"
      title="오늘 마음을 편한 방식으로 열어봐요"
      description="자주 쓰는 계정으로 들어오면 바로 이어서 남길 수 있어요."
    >
      <LoginOptions />
    </AppShell>
  );
}
