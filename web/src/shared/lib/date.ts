export function getTodayDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul"
  }).format(new Date());
}

export function formatKoreanDate(date: string) {
  const target = new Date(`${date}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul"
  }).format(target);
}

export function formatKoreanDateTime(dateTime: string) {
  const target = new Date(dateTime);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul"
  }).format(target);
}
