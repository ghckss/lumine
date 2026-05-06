"use client";

export function JournalSubmitButton({
  disabled,
  isPending,
  onClick
}: {
  disabled: boolean;
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-primaryContainer px-5 text-sm font-semibold text-white shadow-moon disabled:opacity-50"
    >
      {isPending ? "저장하고 있어요" : "오늘 기록 남기기"}
    </button>
  );
}
