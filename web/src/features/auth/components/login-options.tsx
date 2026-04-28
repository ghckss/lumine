"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/shared/components/primary-button";
import { SurfaceCard } from "@/shared/components/surface-card";
import { api } from "@/shared/lib/api";
import { useAuthStore } from "@/shared/store/auth-store";
import type { AuthProvider, SignupPayload } from "@/shared/types/domain";

const providers: { provider: AuthProvider; label: string; description: string }[] = [
  { provider: "kakao", label: "카카오로 이어가기", description: "바로 들어와요" },
  { provider: "google", label: "구글로 이어가기", description: "익숙한 계정으로 들어와요" }
];

const providerButtonStyles: Record<
  AuthProvider,
  {
    outer: string;
    badge: string;
    label: string;
    description: string;
  }
> = {
  kakao: {
    outer:
      "border-[#f2d84b] bg-[#fee500] text-[#191600] shadow-[0_12px_28px_rgba(254,229,0,0.24)] hover:brightness-[0.98]",
    badge: "bg-[#191600]/10 text-[#191600]",
    label: "카카오로 시작",
    description: "카카오 계정으로 들어와요"
  },
  google: {
    outer:
      "border-[#d9dce3] bg-white text-[#202124] shadow-[0_12px_28px_rgba(60,64,67,0.08)] hover:border-[#c6cad1]",
    badge: "bg-[#f1f3f4] text-[#5f6368]",
    label: "Google로 시작",
    description: "구글 계정으로 들어와요"
  }
};

const genderOptions: { value: SignupPayload["gender"]; label: string }[] = [
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
  { value: "other", label: "직접 선택하지 않을래요" }
];

export function LoginOptions() {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [provider, setProvider] = useState<AuthProvider>("kakao");
  const [gender, setGender] = useState<SignupPayload["gender"]>("female");
  const [birthDate, setBirthDate] = useState("1998-05-10");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);

  async function handleLogin(selectedProvider: AuthProvider) {
    setPendingProvider(selectedProvider);
    const response = await api.auth.login(selectedProvider);
    login(selectedProvider, response.data.displayName);
    setPendingProvider(null);
    router.replace("/");
  }

  async function handleSignup() {
    setPendingProvider(provider);
    const response = await api.auth.signup({
      provider,
      gender,
      birthDate,
      agreedToTerms
    });
    signup(provider, response.data.displayName);
    setPendingProvider(null);
    router.replace("/");
  }

  return (
    <div className="grid gap-4">
      <SurfaceCard className="overflow-hidden bg-[linear-gradient(135deg,#f3edff_0%,#ffffff_48%,#f8f5ff_100%)]">
        <p className="text-sm font-medium text-accent">반가워요</p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-text">
          오늘 마음을
          <br />
          편하게 남겨봐요
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          편한 방식으로 시작해요.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-primarySoft px-3 py-2 text-xs font-semibold text-accent">
            오늘의 마음
          </span>
          <span className="rounded-full bg-primarySoft px-3 py-2 text-xs font-semibold text-accent">
            감정 기록
          </span>
          <span className="rounded-full bg-primarySoft px-3 py-2 text-xs font-semibold text-accent">
            천천히
          </span>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <div className="flex gap-2 rounded-full bg-primarySoft p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
              mode === "login" ? "bg-white text-text shadow-sm" : "text-muted"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
              mode === "signup" ? "bg-white text-text shadow-sm" : "text-muted"
            }`}
          >
            회원가입
          </button>
        </div>
      </SurfaceCard>

      {mode === "login" ? (
        <div className="grid gap-3">
          {providers.map(({ provider }) => {
            const style = providerButtonStyles[provider];

            return (
            <SurfaceCard key={provider} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => handleLogin(provider)}
                disabled={pendingProvider !== null}
                className={`w-full rounded-[28px] border px-5 py-5 text-left transition disabled:opacity-60 ${style.outer}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">{style.label}</div>
                    <p className={`mt-1 text-sm leading-6 ${provider === "kakao" ? "text-[#3c3715]" : "text-[#5f6368]"}`}>
                      {pendingProvider === provider ? "연결을 준비하고 있어요" : style.description}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-2 text-xs font-semibold ${style.badge}`}>
                    {provider === "kakao" ? "Kakao" : "Google"}
                  </span>
                </div>
              </button>
            </SurfaceCard>
            );
          })}
          <SurfaceCard>
            <p className="text-sm text-muted">처음이라면</p>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="mt-2 text-sm font-semibold text-accent underline underline-offset-4"
            >
              회원가입하기
            </button>
          </SurfaceCard>
        </div>
      ) : (
        <div className="grid gap-4">
          <SurfaceCard>
            <p className="text-sm font-medium text-accent">가입 정보</p>
            <h2 className="mt-2 text-2xl font-semibold">필요한 정보만 남겨요</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              잠깐이면 충분해요.
            </p>
          </SurfaceCard>

          <SurfaceCard>
            <p className="text-sm text-muted">로그인 방식</p>
            <div className="mt-4 grid gap-2">
              {providers.map((option) => (
                <button
                  key={option.provider}
                  type="button"
                  onClick={() => setProvider(option.provider)}
                  className={`rounded-[18px] border px-4 py-4 text-left text-sm transition ${
                    provider === option.provider
                      ? option.provider === "kakao"
                        ? "border-[#f2d84b] bg-[#fff6b3] text-[#191600]"
                        : "border-[#cfd4dc] bg-[#f8f9fa] text-[#202124]"
                      : "border-line bg-white/80"
                  }`}
                >
                  {option.provider === "kakao" ? "카카오로 시작할래요" : "구글로 시작할래요"}
                </button>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <p className="text-sm text-muted">기본 정보</p>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-sm font-medium text-text">성별</label>
                <div className="mt-2 grid gap-2">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={`rounded-[18px] border px-4 py-3 text-left text-sm transition ${
                        gender === option.value ? "border-accent bg-primarySoft" : "border-line bg-white/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="text-sm font-medium text-text">
                  생년월일
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  className="mt-2 w-full rounded-[18px] border border-line bg-white/80 px-4 py-3 text-sm outline-none"
                />
              </div>

              <label className="flex items-center gap-3 rounded-[18px] border border-line bg-white/80 px-4 py-3 text-sm text-text">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(event) => setAgreedToTerms(event.target.checked)}
                />
                서비스 이용과 개인정보 안내를 확인했어요
              </label>
            </div>
          </SurfaceCard>

          <PrimaryButton
            type="button"
            onClick={handleSignup}
            disabled={!birthDate || !agreedToTerms || pendingProvider !== null}
            className="w-full"
          >
            {pendingProvider ? "잠시만요" : "회원가입"}
          </PrimaryButton>

          <SurfaceCard>
            <p className="text-sm text-muted">이미 시작했다면</p>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="mt-2 text-sm font-semibold text-accent underline underline-offset-4"
            >
              로그인으로 돌아가기
            </button>
          </SurfaceCard>
        </div>
      )}
    </div>
  );
}
