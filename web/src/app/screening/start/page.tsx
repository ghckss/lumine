import Link from "next/link";
import { AppIcon } from "@/shared/components/AppIcon";

export default function ScreeningStartPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-body text-onSurface selection:bg-primaryContainer selection:text-onPrimaryContainer">
      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-screen-md flex-col justify-center px-6 pb-32 pt-8 md:px-12">
        <div className="flex flex-col space-y-16">
          <div className="space-y-8 pr-12 md:pr-24">
            <h2 className="break-keep text-[2.5rem] font-light leading-[1.4] tracking-wider text-primary">
              오늘, 당신의 마음을
              <br />
              가만히 들여다봅니다
            </h2>
            <div className="h-px w-12 bg-primary/20" />
            <p className="break-keep text-[1.05rem] font-light leading-[1.8] text-onSurfaceVariant">
              바쁜 일상을 잠시 멈추고,
              <br />
              내면의 소리에 귀를 기울여보세요.
              <br />
              <br />
              솔직한 대화는
              <br />
              마음의 결을 다스리는 시작이 됩니다.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-6 pt-12">
            <div className="flex items-center space-x-2 text-sm tracking-wide text-secondary/80">
              <AppIcon name="schedule" className="h-[18px] w-[18px] opacity-70" />
              <span>약 3분 소요</span>
            </div>
            <Link
              href="/screening/questions"
              className="group flex w-full items-center justify-center space-x-4 rounded-full bg-gradient-to-br from-primary to-primaryContainer px-12 py-5 text-lg text-white shadow-moon transition-all duration-500 hover:opacity-90 sm:w-auto"
            >
              <span className="font-medium tracking-widest">시작하기</span>
              <AppIcon name="arrow-forward" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
