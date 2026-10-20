"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/PageHead";
import { isApiConfigured } from "@/config/env";
import { useLumine } from "@/hooks/useLumine";
import { api } from "@/api";
import { answerLabels, questions, type Screening } from "@/lib/Constants";

const primary =
  "min-h-11 rounded-full bg-[#72559d] px-6 text-xs font-extrabold text-white shadow-[0_9px_22px_rgba(114,85,157,.2)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40";

export function CheckScreen() {
  const { navigate, saveScreening } = useLumine();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Screening | null>(null);
  const [questionTitles, setQuestionTitles] = useState<string[]>([...questions]);
  const selected = answers[index];

  useEffect(() => {
    if (!isApiConfigured) return;

    let active = true;
    api
      .getScreeningQuestionnaire()
      .then((questionnaire) =>
        questionnaire.sections.flatMap((section) =>
          section.items.filter((item) => item.kind === "single_choice").map((item) => item.title),
        ),
      )
      .then((titles) => {
        if (active && titles.length > 0) setQuestionTitles(titles);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  if (result) {
    const title =
      result.score < 5
        ? "대체로 편안한 흐름이에요"
        : result.score < 10
          ? "조금 지친 마음이 보여요"
          : result.score < 15
            ? "마음에 휴식이 필요해 보여요"
            : "혼자 견디지 않아도 괜찮아요";
    const body =
      result.score < 5
        ? "지금의 안정적인 리듬을 지키며, 작은 감정 변화도 계속 살펴봐 주세요."
        : result.score < 10
          ? "일상 속 부담이 조금 쌓여 있는 것 같아요. 잠깐 멈추고 나를 돌보는 시간을 마련해 보세요."
          : "최근의 어려움이 제법 크게 느껴졌을 수 있어요. 믿을 수 있는 사람이나 전문가에게 현재 마음을 나눠보는 것을 권해요.";
    return (
      <>
        <PageHead
          kicker="마음 확인 결과"
          title="지금의 마음을 있는 그대로 바라봤어요"
          subtitle="점수보다 중요한 건 내 마음을 살펴본 오늘의 선택이에요."
        />
        <div className="mx-auto max-w-3xl">
          <article className="rounded-[26px] border border-[#e5ddf3] bg-white/90 p-8 text-center shadow-[0_18px_55px_rgba(63,45,92,.08)] max-sm:p-5">
            <div className="mx-auto grid size-32 place-items-center rounded-full bg-[#eee7ff] text-[#5d4087]">
              <div>
                <strong className="block font-serif text-5xl">{result.score}</strong>
                <span className="text-[10px] font-bold">/ 30점</span>
              </div>
            </div>
            <h2 className="mt-7 font-serif text-2xl font-bold">{title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#746985]">{body}</p>
            {result.safety ? (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#efc6cb] bg-[#fff3f4] p-4 text-left text-xs leading-6 text-[#984b58]">
                지금 스스로를 해칠 생각이 구체적이거나 위험하다고 느껴진다면 혼자 있지 말고 즉시
                112·119 또는 자살예방상담전화 109에 연락해 주세요.
              </div>
            ) : null}
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              <button className={primary} onClick={() => navigate("home")}>
                홈으로 돌아가기
              </button>
              <button
                className={`${primary} bg-[#eee7ff] text-[#5d4087] shadow-none`}
                onClick={() => {
                  setResult(null);
                  setIndex(0);
                  setAnswers({});
                }}
              >
                다시 확인하기
              </button>
            </div>
          </article>
        </div>
      </>
    );
  }

  function next() {
    if (selected === undefined) return;
    if (index < questionTitles.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
    setResult(saveScreening({ score, safety: answers[8] > 0 }));
  }

  return (
    <>
      <PageHead
        kicker="마음 상태 확인"
        title="최근 2주간의 마음을 살펴봐요"
        subtitle="의학적 진단이 아닌 자기 점검 도구예요. 편안한 속도로 답해주세요."
      />
      <div className="mx-auto max-w-3xl">
        <article className="rounded-[26px] border border-[#e5ddf3] bg-white/90 p-8 shadow-[0_18px_55px_rgba(63,45,92,.08)] max-sm:p-5">
          <div className="flex justify-between text-[10px] font-bold text-[#887c96]">
            <span>
              {index + 1} / {questionTitles.length}
            </span>
            <span>{Math.round(((index + 1) / questionTitles.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eeeaf4]">
            <span
              className="block h-full rounded-full bg-[#72559d] transition-[width] duration-300"
              style={{ width: `${((index + 1) / questionTitles.length) * 100}%` }}
            />
          </div>
          <span className="mt-8 block text-[10px] font-extrabold tracking-[.14em] text-[#72559d]">
            QUESTION {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="mt-3 min-h-20 font-serif text-[clamp(21px,3vw,29px)] leading-snug font-bold">
            {questionTitles[index]}
          </h2>
          <div className="mt-6 grid gap-2.5">
            {answerLabels.map((answer, score) => (
              <button
                className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition hover:border-[#ae99cc] hover:bg-[#faf8fd] ${selected === score ? "border-[#9276ba] bg-[#eee7ff] text-[#4f356f] ring-1 ring-[#c7b7df]" : "border-[#e5ddf3] bg-white text-[#62586e]"}`}
                key={answer}
                onClick={() => setAnswers((current) => ({ ...current, [index]: score }))}
                aria-pressed={selected === score}
              >
                <span>{answer}</span>
                <span
                  className={`size-4 rounded-full border ${selected === score ? "border-4 border-[#72559d] bg-white" : "border-[#cbc1d6]"}`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <div className="mt-7 flex justify-between gap-3">
            <button
              className={`${primary} bg-transparent text-[#746985] shadow-none`}
              disabled={index === 0}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
            >
              ← 이전
            </button>
            <button className={primary} disabled={selected === undefined} onClick={next}>
              {index === questionTitles.length - 1 ? "결과 확인하기" : "다음 질문"}
            </button>
          </div>
        </article>
      </div>
    </>
  );
}
