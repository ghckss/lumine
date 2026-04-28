export function formatKoreanDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(date));
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
