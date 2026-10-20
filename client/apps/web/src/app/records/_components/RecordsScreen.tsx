"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { EmotionChip } from "@/components/EmotionChip";
import { PageHead } from "@/components/PageHead";
import { useLumine } from "@/hooks/useLumine";
import { emotionColors, koreanDate, localIsoDate } from "@/lib/Constants";

function monthGrid(date: Date) {
  const year = date.getFullYear(),
    month = date.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return { date: localIsoDate(day), day: day.getDate(), current: day.getMonth() === month };
  });
}

export function RecordsScreen() {
  const { data, deleteJournal, navigate } = useLumine();
  const initialDate =
    typeof window === "undefined"
      ? localIsoDate()
      : (sessionStorage.getItem("lumine:selected-date") ?? localIsoDate());
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarDate, setCalendarDate] = useState(() => new Date(`${initialDate}T12:00:00`));
  const recordsByDate = useMemo(
    () => new Map(data.journals.map((record) => [record.date, record])),
    [data.journals],
  );
  const grid = useMemo(() => monthGrid(calendarDate), [calendarDate]);
  const selected = recordsByDate.get(selectedDate);
  const monthLabel = calendarDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
  function moveMonth(delta: number) {
    setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }
  function removeRecord() {
    if (!selected || !window.confirm("이 기록을 삭제할까요? 삭제 후에는 복구할 수 없어요.")) return;
    deleteJournal(selected.id);
  }

  const card =
    "rounded-[24px] border border-[#e5ddf3] bg-white/85 p-6 shadow-[0_18px_55px_rgba(63,45,92,.07)] max-sm:p-4";
  return (
    <>
      <PageHead
        kicker="마음 기록"
        title="지나온 마음을 천천히 돌아봐요"
        subtitle="기록이 쌓일수록 나만의 감정 리듬이 조금씩 보이기 시작해요."
        action={
          <button
            className="min-h-11 shrink-0 rounded-full bg-[#72559d] px-5 text-xs font-extrabold text-white max-sm:hidden"
            onClick={() => navigate("journal")}
          >
            새 기록 쓰기
          </button>
        }
      />
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(280px,.7fr)] gap-5 max-lg:grid-cols-1">
        <article className={card}>
          <div className="flex items-center justify-between">
            <button
              className="grid size-10 place-items-center rounded-full border border-[#e5ddf3] text-xl text-[#72559d] hover:bg-[#f3eff9]"
              onClick={() => moveMonth(-1)}
              aria-label="이전 달"
            >
              ‹
            </button>
            <h2 className="font-serif text-lg font-bold">{monthLabel}</h2>
            <button
              className="grid size-10 place-items-center rounded-full border border-[#e5ddf3] text-xl text-[#72559d] hover:bg-[#f3eff9]"
              onClick={() => moveMonth(1)}
              aria-label="다음 달"
            >
              ›
            </button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 max-sm:gap-0">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span className="py-2 text-center text-[10px] font-bold text-[#958ba2]" key={day}>
                {day}
              </span>
            ))}
            {grid.map((item) => {
              const record = recordsByDate.get(item.date);
              const emotion = record?.emotions[0];
              const active = item.date === selectedDate;
              return (
                <button
                  key={item.date}
                  className={`relative grid aspect-square min-h-10 place-items-center rounded-xl text-xs transition hover:bg-[#f1ecf8] ${item.current ? "text-[#41374e]" : "text-[#c2bacb]"} ${active ? "bg-[#eee7ff] font-extrabold text-[#5d4087] ring-1 ring-[#b8a3d7]" : ""}`}
                  onClick={() => setSelectedDate(item.date)}
                  aria-label={`${koreanDate(item.date)}${record ? `, ${emotion} 기록 있음` : ", 기록 없음"}`}
                  aria-pressed={active}
                >
                  <span>{item.day}</span>
                  {emotion ? (
                    <i
                      className="absolute bottom-[12%] size-1.5 rounded-full"
                      style={{ background: emotionColors[emotion] } as CSSProperties}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </article>
        <aside className={card}>
          {selected ? (
            <>
              <div className="text-[11px] font-extrabold tracking-[.08em] text-[#72559d]">
                {koreanDate(selected.date)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.emotions.map((emotion) => (
                  <EmotionChip key={emotion} emotion={emotion} />
                ))}
              </div>
              <p className="mt-6 min-h-28 text-sm leading-7 whitespace-pre-wrap text-[#4f465e]">
                {selected.body || "본문 없이 감정만 기록했어요."}
              </p>
              <div className="mt-6 rounded-2xl bg-[#f3eef9] p-4 text-[12px] leading-6 text-[#5e4b78]">
                💜 {selected.comfortMessage}
              </div>
              <div className="mt-5 text-right">
                <button className="text-xs font-bold text-[#b25363]" onClick={removeRecord}>
                  기록 삭제
                </button>
              </div>
            </>
          ) : (
            <div className="grid min-h-72 place-items-center text-center text-sm leading-7 text-[#8a8098]">
              <div>
                <span className="mb-2 block text-2xl">🌙</span>
                {koreanDate(selectedDate)}에는
                <br />
                아직 기록이 없어요.
                <br />
                <button
                  className="mt-2 font-bold text-[#72559d]"
                  onClick={() => navigate("journal")}
                >
                  마음 기록하기
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
