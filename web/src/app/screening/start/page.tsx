import { ScreeningStartIntroSection } from "./_component/ScreeningStartIntroSection";

export default function ScreeningStartPage() {
  return (
    <div className="min-h-screen font-body text-onSurface selection:bg-primaryContainer selection:text-onPrimaryContainer">
      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center px-6 pb-32 pt-8 md:px-12">
        <ScreeningStartIntroSection />
      </main>
    </div>
  );
}
