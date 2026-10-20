"use client";

import { PageHead } from "@/components/PageHead";
import { useLumine } from "@/hooks/useLumine";
import { localIsoDate } from "@/lib/Constants";

export function SettingsScreen() {
  const { data, rename, clearData } = useLumine();
  function changeName() {
    const value = window.prompt("어떤 이름으로 불러드릴까요?", data.name);
    if (value?.trim()) rename(value);
  }
  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          { schemaVersion: "lumine-web-v2", exportedAt: new Date().toISOString(), ...data },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lumine-${localIsoDate()}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function removeAll() {
    if (window.confirm("이 브라우저에 저장된 모든 기록을 지울까요? 이 작업은 되돌릴 수 없어요."))
      clearData();
  }
  const card =
    "rounded-[24px] border border-[#e5ddf3] bg-white/85 p-6 shadow-[0_18px_55px_rgba(63,45,92,.07)] max-sm:p-5";
  const row =
    "flex min-h-20 items-center justify-between gap-5 border-b border-[#eee9f4] py-4 last:border-b-0";

  return (
    <>
      <PageHead
        kicker="설정"
        title="나에게 편안한 방식으로"
        subtitle="Lumine을 사용하는 방법과 브라우저의 기록을 관리해요."
      />
      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <article className={card}>
          <h2 className="font-serif text-lg font-bold">프로필</h2>
          <div className={`${row} mt-3`}>
            <div>
              <strong className="block text-sm">이름</strong>
              <span className="mt-1 block text-[11px] text-[#80758d]">
                화면에 표시되는 이름이에요.
              </span>
            </div>
            <button className="shrink-0 text-xs font-extrabold text-[#72559d]" onClick={changeName}>
              {data.name} 님
            </button>
          </div>
          <div className={row}>
            <div>
              <strong className="block text-sm">이용 모드</strong>
              <span className="mt-1 block text-[11px] text-[#80758d]">
                현재 브라우저에만 저장됩니다.
              </span>
            </div>
            <b className="rounded-full bg-[#eee7ff] px-3 py-2 text-[10px] text-[#5e4387]">게스트</b>
          </div>
        </article>
        <article className={card}>
          <h2 className="font-serif text-lg font-bold">데이터 관리</h2>
          <div className={`${row} mt-3`}>
            <div>
              <strong className="block text-sm">기록 내려받기</strong>
              <span className="mt-1 block text-[11px] text-[#80758d]">
                모든 기록을 JSON 파일로 보관해요.
              </span>
            </div>
            <button className="shrink-0 text-xs font-extrabold text-[#72559d]" onClick={exportData}>
              내려받기
            </button>
          </div>
          <div className={row}>
            <div>
              <strong className="block text-sm text-[#a84f5d]">모든 기록 지우기</strong>
              <span className="mt-1 block text-[11px] text-[#80758d]">
                삭제한 기록은 복구할 수 없어요.
              </span>
            </div>
            <button className="shrink-0 text-xs font-extrabold text-[#b25363]" onClick={removeAll}>
              삭제
            </button>
          </div>
        </article>
        <article className="rounded-[22px] border border-[#e5ddf3] bg-white/60 p-6">
          <h2 className="font-serif text-base font-bold">꼭 알아두세요</h2>
          <p className="mt-3 text-xs leading-6 text-[#746985]">
            Lumine의 마음 확인은 의학적 진단을 대신하지 않습니다. 지속적인 어려움이 있다면 정신건강
            전문가와 상담해 주세요.
          </p>
        </article>
        <article className="rounded-[22px] border border-[#dcece7] bg-[#f1f8f6] p-6">
          <h2 className="font-serif text-base font-bold">도움이 필요한 순간</h2>
          <p className="mt-3 text-xs leading-6 text-[#647b75]">
            긴급한 위험이 있다면 112·119, 자살예방상담전화 109에 바로 연락하세요.
          </p>
        </article>
      </div>
    </>
  );
}
