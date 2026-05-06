export function ScreeningQuestionActions({
  disabled,
  isLast,
  isPending,
  onNext,
  onPrevious,
  showPreviousButton,
  showTextActionButton
}: {
  disabled: boolean;
  isLast: boolean;
  isPending: boolean;
  onNext: () => void;
  onPrevious: () => void;
  showPreviousButton: boolean;
  showTextActionButton: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex w-full max-w-xl items-center justify-between bg-gradient-to-t from-background via-background/90 to-transparent px-8 pb-12 pt-8">
      <div className={`${showPreviousButton && showTextActionButton ? "grid grid-cols-2" : "flex justify-end"} w-full gap-3`}>
        {showPreviousButton ? (
          <button
            type="button"
            onClick={onPrevious}
            className="w-full rounded-full bg-surfaceContainerLowest px-5 py-4 text-center text-sm font-medium tracking-widest text-primary transition-colors duration-500 ease-out hover:bg-surfaceContainerLow"
          >
            이전 질문
          </button>
        ) : null}
        {showTextActionButton ? (
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className={`${showPreviousButton ? "w-full" : "max-w-[200px]"} rounded-full bg-secondaryContainer px-5 py-4 text-center text-sm font-medium tracking-widest text-tertiary transition-colors duration-500 ease-out hover:bg-tertiaryContainer disabled:opacity-50`}
          >
            {isLast ? (isPending ? "정리하는 중" : "결과 보기") : "다음으로"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
