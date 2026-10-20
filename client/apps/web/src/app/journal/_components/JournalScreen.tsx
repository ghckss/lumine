"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { PageHead } from "@/components/PageHead";
import { useLumine } from "@/hooks/useLumine";
import { emotionColors, emotionIcons, emotions, localIsoDate, type Emotion } from "@/lib/Constants";

export function JournalScreen() {
  const { data, saveJournal, navigate, notify } = useLumine();
  const today = localIsoDate();
  const existing = useMemo(
    () => data.journals.find((record) => record.date === today),
    [data.journals, today],
  );
  const [date, setDate] = useState(existing?.date ?? today);
  const [selected, setSelected] = useState<Emotion[]>(existing?.emotions ?? []);
  const [body, setBody] = useState(existing?.body ?? "");

  function toggleEmotion(emotion: Emotion) {
    setSelected((current) => {
      if (current.includes(emotion)) return current.filter((item) => item !== emotion);
      if (current.length >= 3) {
        notify("감정은 3개까지 고를 수 있어요.");
        return current;
      }
      return [...current, emotion];
    });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected.length) {
      notify("지금 마음과 가까운 감정을 하나 골라주세요.");
      return;
    }
    saveJournal({ date, emotions: selected, body: body.trim() });
    sessionStorage.setItem("lumine:selected-date", date);
    navigate("records");
  }

  return (
    <>
      <PageHead
        kicker="감정 일기"
        title="오늘의 마음에 이름을 붙여볼까요?"
        subtitle="잘 쓰려 하지 않아도 괜찮아요. 지금 느끼는 그대로면 충분해요."
      />
      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(250px,.7fr)] gap-5 max-lg:grid-cols-1">
        <form
          className="rounded-[24px] border border-[#e5ddf3] bg-white/85 p-7 shadow-[0_18px_55px_rgba(63,45,92,.07)] max-sm:p-5"
          onSubmit={submit}
        >
          <div>
            <label className="block text-xs font-extrabold text-[#3f2d5c]" htmlFor="journal-date">
              기록할 날짜
            </label>
            <input
              className="mt-3 min-h-11 w-full rounded-xl border border-[#ded6ea] bg-[#fbfaff] px-3.5 text-sm transition outline-none focus:border-[#9276ba] focus:ring-3 focus:ring-[#e9e0f8]"
              id="journal-date"
              type="date"
              max={today}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="mt-7">
            <span className="block text-xs font-extrabold text-[#3f2d5c]">
              지금 어떤 감정을 느끼나요?
            </span>
            <span className="mt-1.5 block text-[11px] text-[#857a92]">
              가장 가까운 감정을 3개까지 골라주세요.
            </span>
            <div className="mt-4 flex flex-wrap gap-2">
              {emotions.map((emotion) => {
                const active = selected.includes(emotion);
                return (
                  <button
                    type="button"
                    key={emotion}
                    className={`rounded-full border px-3 py-2 text-[11px] font-bold transition hover:-translate-y-0.5 ${active ? "shadow-md ring-2 ring-[#72559d]/25" : "bg-white"}`}
                    style={
                      {
                        background: active
                          ? `color-mix(in srgb, ${emotionColors[emotion]} 22%, white)`
                          : "white",
                        borderColor: active ? emotionColors[emotion] : "#e5ddf3",
                      } as CSSProperties
                    }
                    onClick={() => toggleEmotion(emotion)}
                    aria-pressed={active}
                  >
                    {emotionIcons[emotion]} {emotion}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-7">
            <label className="block text-xs font-extrabold text-[#3f2d5c]" htmlFor="journal-body">
              마음에 남은 이야기를 적어주세요
            </label>
            <textarea
              className="mt-3 min-h-56 w-full resize-y rounded-2xl border border-[#ded6ea] bg-[#fbfaff] p-4 text-sm leading-7 transition outline-none placeholder:text-[#aaa1b4] focus:border-[#9276ba] focus:ring-3 focus:ring-[#e9e0f8]"
              id="journal-body"
              maxLength={1000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="오늘 있었던 일, 문득 떠오른 생각, 몸의 느낌… 무엇이든 괜찮아요."
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-[10px] text-[#958ba2]" aria-live="polite">
              {body.length} / 1,000
            </span>
            <button
              className="min-h-11 rounded-full bg-[#72559d] px-6 text-xs font-extrabold text-white shadow-[0_9px_22px_rgba(114,85,157,.22)] transition hover:-translate-y-0.5 hover:bg-[#63458d]"
              type="submit"
            >
              {existing ? "오늘 기록 수정하기" : "마음 기록 저장하기"}
            </button>
          </div>
        </form>
        <aside className="grid content-start gap-4">
          <article className="rounded-[24px] bg-linear-to-br from-[#4a3269] to-[#8265a9] p-7 text-white shadow-[0_18px_50px_rgba(63,45,92,.16)]">
            <span className="text-[10px] font-extrabold tracking-[.14em] text-[#dfd3f1] uppercase">
              오늘의 작은 질문
            </span>
            <blockquote className="mt-6 font-serif text-xl leading-8 font-bold">
              “오늘 나를 잠깐이라도 편안하게 만든 순간이 있었나요?”
            </blockquote>
            <small className="mt-5 block text-[11px] leading-6 text-[#e8dff4]">
              답이 떠오르지 않아도 괜찮아요. 질문 곁에 잠시 머무르는 것만으로 충분해요.
            </small>
          </article>
          <div className="flex gap-3 rounded-2xl border border-[#dcece7] bg-[#f1f8f6] p-4 text-[11px] leading-5 text-[#647b75]">
            <span>◉</span>
            <span>이 브라우저에서 작성한 기록은 기기 안에만 저장됩니다.</span>
          </div>
        </aside>
      </div>
    </>
  );
}
