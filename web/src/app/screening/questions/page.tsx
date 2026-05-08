import { serverApi } from "@/shared/lib/server-api";
import { ScreeningQuestionsClient } from "./_component/ScreeningQuestionsClient";

export const revalidate = 60 * 60 * 24;

export default async function ScreeningQuestionsPage() {
  const questionnaire = await serverApi.getScreeningQuestionnaire().catch(() => null);

  return <ScreeningQuestionsClient initialQuestionnaire={questionnaire} />;
}
