export function getGreeting(hour = new Date().getHours()) {
  if (hour < 6) return "잠 못 드는 밤이네요";
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후예요";
  return "오늘 하루도 수고했어요";
}
