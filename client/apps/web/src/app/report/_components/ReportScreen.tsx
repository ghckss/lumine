"use client";

import { useMemo, type CSSProperties } from "react";
import { PageHead } from "@/components/PageHead";
import { useLumine } from "@/hooks/useLumine";
import {
  calculateStreak,
  emotionColors,
  emotionIcons,
  emotionStats,
  lastDays,
} from "@/lib/Constants";

export function ReportScreen() {
  const { data, navigate } = useLumine();
  const recentDays = useMemo(() => new Set(lastDays(30)), []);
  const recent = useMemo(
    () => data.journals.filter((record) => recentDays.has(record.date)),
    [data.journals, recentDays],
  );
  const stats = useMemo(() => emotionStats(data.journals), [data.journals]);
  const max = Math.max(1, ...stats.map(([, count]) => count));
  const streak = useMemo(() => calculateStreak(data.journals), [data.journals]);
  const card =
    "rounded-[24px] border border-[#e5ddf3] bg-white/85 p-6 shadow-[0_18px_55px_rgba(63,45,92,.07)]";

  return (
    <>
      <PageHead
        kicker="마음 리포트"
        title="기록 속에서 나만의 흐름을 발견해요"
        subtitle="최근 30일 동안 남긴 감정 기록을 바탕으로 정리했어요."
      />
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
        {[
          ["최근 30일 기록", `${recent.length}일`],
          ["이어진 기록", `${streak}일`],
          ["발견한 감정", `${stats.length}가지`],
        ].map(([label, value]) => (
          <article className={`${card} bg-linear-to-br from-white to-[#faf7ff]`} key={label}>
            <span className="text-[11px] font-bold text-[#81758f]">{label}</span>
            <strong className="mt-3 block font-serif text-3xl text-[#4f356f]">{value}</strong>
          </article>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1.5fr)_minmax(270px,.7fr)] gap-5 max-lg:grid-cols-1">
        <article className={card}>
          <h2 className="font-serif text-lg font-bold">감정 분포</h2>
          <p className="mt-1 text-xs text-[#746985]">전체 기록에서 자주 등장한 감정이에요.</p>
          {stats.length ? (
            <div className="mt-6 grid gap-4">
              {stats.slice(0, 8).map(([emotion, count]) => (
                <div
                  className="grid grid-cols-[88px_1fr_24px] items-center gap-3 text-xs"
                  key={emotion}
                >
                  <span>
                    {emotionIcons[emotion]} {emotion}
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-[#eeeaf4]">
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={
                        {
                          width: `${(count / max) * 100}%`,
                          background: emotionColors[emotion],
                        } as CSSProperties
                      }
                    />
                  </div>
                  <b className="text-right text-[#746985]">{count}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#d9cee8] py-12 text-center text-sm leading-7 text-[#8a8098]">
              <span className="mb-2 block text-xl">⌁</span>기록이 쌓이면 감정의 흐름을 보여드릴게요.
            </div>
          )}
        </article>
        <aside className="grid content-start gap-5">
          <article className={card}>
            <div className="flex justify-between">
              <h2 className="font-serif text-lg font-bold">이번 달의 발견</h2>
              <span>✨</span>
            </div>
            <div className="mt-5 rounded-2xl bg-[#f3eef9] p-4 text-[13px] leading-7 text-[#5e4b78]">
              {stats.length
                ? `${stats[0][0]}의 마음이 가장 자주 머물렀어요. 감정을 판단하기보다, 그 마음이 필요로 한 것을 가만히 떠올려보세요.`
                : "마음을 기록하는 순간부터 변화는 시작돼요. 오늘의 감정에 이름을 붙여보세요."}
            </div>
          </article>
          <button
            className="rounded-[22px] bg-linear-to-br from-[#e8f5f1] to-[#f7fbfa] p-6 text-left shadow-[0_14px_40px_rgba(77,146,131,.1)] transition hover:-translate-y-0.5"
            onClick={() => navigate("journal")}
          >
            <span className="text-2xl">✍️</span>
            <strong className="mt-4 block font-serif text-base">오늘의 기록 남기기</strong>
            <span className="mt-1 block text-[11px] text-[#647b75]">
              작은 마음도 소중히 모아둘게요.
            </span>
          </button>
        </aside>
      </div>
    </>
  );
}
