"use client";

import { memo, useMemo } from "react";
import { getGreeting } from "@lumine/domain";
import { EmotionChip } from "@/components/EmotionChip";
import { PageHead } from "@/components/PageHead";
import { useLumine } from "@/hooks/useLumine";
import {
  emotionColors,
  emotionIcons,
  emotionStats,
  koreanDate,
  lastDays,
  localIsoDate,
  type Journal,
} from "@/lib/Constants";

const card =
  "rounded-[24px] border border-[#e5ddf3]/90 bg-white/85 p-6 shadow-[0_18px_55px_rgba(63,45,92,.07)] backdrop-blur-sm max-sm:rounded-[20px] max-sm:p-5";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-[#72559d] px-5 text-xs font-extrabold text-white shadow-[0_9px_22px_rgba(114,85,157,.22)] transition hover:-translate-y-0.5 hover:bg-[#63458d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72559d]";

function RecordButton({ record, onOpen }: { record: Journal; onOpen: () => void }) {
  return (
    <button
      className="w-full rounded-2xl border border-[#ece6f5] bg-[#fbfaff] px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#cfc1e6] hover:shadow-md"
      onClick={onOpen}
    >
      <span className="flex flex-wrap justify-between gap-2 text-[10px] font-bold tracking-[.02em] text-[#8a8098]">
        <span>{koreanDate(record.date, false)}</span>
        <span>
          {record.emotions
            .slice(0, 2)
            .map((emotion) => `${emotionIcons[emotion]} ${emotion}`)
            .join(" · ")}
        </span>
      </span>
      <span className="mt-2 line-clamp-2 block text-[13px] leading-6 text-[#4f465e]">
        {record.body || "오늘의 감정을 기록했어요."}
      </span>
    </button>
  );
}

export const HomeScreen = memo(function HomeScreen() {
  const { data, navigate } = useLumine();
  const today = localIsoDate();
  const byDate = useMemo(
    () => new Map(data.journals.map((record) => [record.date, record])),
    [data.journals],
  );
  const week = useMemo(() => lastDays(7), []);
  const latest = useMemo(() => data.journals.slice(0, 3), [data.journals]);
  const frequent = useMemo(() => emotionStats(data.journals).slice(0, 4), [data.journals]);
  const hasToday = byDate.has(today);

  return (
    <>
      <PageHead
        kicker="오늘의 마음"
        title={`${getGreeting()}, ${data.name} 님`}
        subtitle="서두르지 않아도 괜찮아요. 지금 마음이 머무는 곳부터 살펴봐요."
      />
      <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(270px,.75fr)] gap-5 max-lg:grid-cols-1">
        <div className="grid gap-5">
          <article className="relative min-h-[330px] overflow-hidden rounded-[28px] bg-linear-to-br from-[#4a3269] via-[#684c90] to-[#9a7dc4] p-8 text-white shadow-[0_24px_65px_rgba(63,45,92,.2)] max-sm:min-h-0 max-sm:rounded-[22px] max-sm:p-6">
            <div className="absolute -top-20 -right-14 size-64 rounded-full bg-white/8" />
            <div className="absolute top-9 right-14 size-24 rounded-full bg-[#fff4cb] shadow-[0_0_55px_rgba(255,244,203,.35)] max-sm:size-16" />
            <div className="relative z-10 max-w-[560px]">
              <div className="text-[10px] font-extrabold tracking-[.18em] text-[#ddd0f2]">
                TODAY&apos;S MOMENT
              </div>
              <h2 className="mt-5 font-serif text-[clamp(30px,4vw,46px)] leading-[1.18] font-bold tracking-[-.04em]">
                당신의 오늘도
                <br />
                충분히 빛나고 있어요.
              </h2>
              <p className="mt-5 max-w-[500px] text-[13px] leading-7 text-[#ece4f8]">
                좋았던 마음도, 설명하기 어려운 마음도 모두 괜찮아요. 오늘의 감정을 있는 그대로
                남겨보세요.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <button
                  className="min-h-11 rounded-full bg-white px-5 text-xs font-extrabold text-[#4a3269] shadow-lg transition hover:-translate-y-0.5"
                  onClick={() => navigate("journal")}
                >
                  {hasToday ? "오늘 기록 보기" : "오늘 마음 기록하기"}
                </button>
                <button
                  className="min-h-11 rounded-full border border-white/30 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
                  onClick={() => navigate("check")}
                >
                  마음 확인
                </button>
              </div>
            </div>
          </article>
          <article className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg font-bold">이번 주 마음의 궤적</h2>
                <p className="mt-1 text-xs leading-5 text-[#746985]">
                  하루하루의 감정이 하나의 별자리처럼 이어져요.
                </p>
              </div>
              <button
                className="shrink-0 text-xs font-bold text-[#72559d]"
                onClick={() => navigate("report")}
              >
                자세히 보기 →
              </button>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2">
              {week.map((day) => {
                const record = byDate.get(day);
                const emotion = record?.emotions[0];
                return (
                  <div className="grid justify-items-center gap-2" key={day}>
                    <div
                      className={`grid aspect-square w-full max-w-[58px] place-items-center rounded-full border text-lg transition ${day === today ? "ring-2 ring-[#72559d] ring-offset-2" : ""}`}
                      style={{
                        background: emotion
                          ? `color-mix(in srgb, ${emotionColors[emotion]} 22%, white)`
                          : "#f4f0f8",
                        borderColor: emotion
                          ? `color-mix(in srgb, ${emotionColors[emotion]} 48%, white)`
                          : "#ebe5f1",
                      }}
                    >
                      {emotion ? emotionIcons[emotion] : "·"}
                    </div>
                    <span className="text-[10px] text-[#8d8399]">
                      {new Date(`${day}T00:00:00`).toLocaleDateString("ko-KR", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>
          <article className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg font-bold">최근 감정 일기</h2>
                <p className="mt-1 text-xs text-[#746985]">지나온 마음을 천천히 돌아보세요.</p>
              </div>
              <button
                className="text-xs font-bold text-[#72559d]"
                onClick={() => navigate("records")}
              >
                전체 보기 →
              </button>
            </div>
            {latest.length ? (
              <div className="mt-5 grid gap-2.5">
                {latest.map((record) => (
                  <RecordButton
                    key={record.id}
                    record={record}
                    onOpen={() => {
                      sessionStorage.setItem("lumine:selected-date", record.date);
                      navigate("records");
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[#d9cee8] py-10 text-center text-sm leading-7 text-[#8a8098]">
                <span className="mb-1 block text-xl">✦</span>아직 남긴 기록이 없어요.
                <br />
                <button className="font-bold text-[#72559d]" onClick={() => navigate("journal")}>
                  첫 마음 기록하기
                </button>
              </div>
            )}
          </article>
        </div>
        <div className="grid content-start gap-5">
          <article className={card}>
            <div className="flex justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold">마음 상태 확인</h2>
                <p className="mt-1 text-xs text-[#746985]">최근 2주간의 나를 살펴봐요.</p>
              </div>
              <span>💜</span>
            </div>
            <p className="mt-5 text-[13px] leading-6 text-[#746985]">
              정답은 없어요. 가장 가까운 답을 고르면 충분합니다.
            </p>
            <button
              className={`${button} mt-5 w-full bg-[#eee7ff] text-[#5f4388] shadow-none hover:bg-[#e2d6fb]`}
              onClick={() => navigate("check")}
            >
              천천히 시작하기
            </button>
          </article>
          <article className={card}>
            <h2 className="font-serif text-lg font-bold">자주 머문 감정</h2>
            <p className="mt-1 text-xs text-[#746985]">최근 기록을 기준으로 보여드려요.</p>
            {frequent.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {frequent.map(([emotion]) => (
                  <EmotionChip key={emotion} emotion={emotion} />
                ))}
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2.5 max-[380px]:grid-cols-1">
                <button
                  className="rounded-2xl bg-[#f5f1fb] p-4 text-left transition hover:-translate-y-0.5"
                  onClick={() => navigate("journal")}
                >
                  <span className="block text-xl">✍️</span>
                  <strong className="mt-3 block text-xs">감정 일기</strong>
                  <span className="mt-1 block text-[10px] leading-5 text-[#746985]">
                    오늘의 마음을 기록해요
                  </span>
                </button>
                <button
                  className="rounded-2xl bg-[#edf7f4] p-4 text-left transition hover:-translate-y-0.5"
                  onClick={() => navigate("records")}
                >
                  <span className="block text-xl">🌙</span>
                  <strong className="mt-3 block text-xs">기록 보기</strong>
                  <span className="mt-1 block text-[10px] leading-5 text-[#746985]">
                    마음의 흐름을 살펴봐요
                  </span>
                </button>
              </div>
            )}
          </article>
          <article className="rounded-[22px] border border-[#dcece7] bg-[#f1f8f6] p-5">
            <div className="flex justify-between gap-3">
              <h2 className="font-serif text-sm font-bold">당신의 기록은 안전해요</h2>
              <span>🔒</span>
            </div>
            <p className="mt-2 text-[11px] leading-6 text-[#647b75]">
              게스트 기록은 지금 사용 중인 브라우저에만 저장됩니다. 기기를 함께 쓴다면 사용 후
              기록을 지워주세요.
            </p>
          </article>
        </div>
      </div>
    </>
  );
});
