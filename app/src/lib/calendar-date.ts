export type DateRange = { start: string; end: string };

export type CalendarDay = {
  date: string;
  day: number;
  inMonth: boolean;
};

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && formatIsoDate(parseIsoDate(value)) === value;
}

export function formatIsoDate(date: Date) {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
    .join("-");
}

export function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function localIsoDate(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
    .join("-");
}

export function listIsoDays(start: string, end: string) {
  const first = parseIsoDate(start);
  const last = parseIsoDate(end);
  if (!isValidIsoDate(start) || !isValidIsoDate(end) || first > last) return [];
  const days: string[] = [];
  for (let cursor = first; cursor <= last; cursor = addDays(cursor, 1)) days.push(formatIsoDate(cursor));
  return days;
}

export function monthRange(monthDate: string): DateRange {
  if (!isValidIsoDate(monthDate)) throw new Error("유효한 날짜가 필요해요.");
  const date = parseIsoDate(monthDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return {
    start: formatIsoDate(new Date(Date.UTC(year, month, 1))),
    end: formatIsoDate(new Date(Date.UTC(year, month + 1, 0)))
  };
}

export function shiftMonth(monthDate: string, amount: number) {
  if (!isValidIsoDate(monthDate)) throw new Error("유효한 날짜가 필요해요.");
  const date = parseIsoDate(monthDate);
  return formatIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)));
}

export function buildMonthGrid(monthDate: string): CalendarDay[] {
  const range = monthRange(monthDate);
  const first = parseIsoDate(range.start)!;
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = parseIsoDate(range.end).getUTCDate();
  const cellCount = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  return Array.from({ length: cellCount }, (_, index) => {
    const date = addDays(first, index - mondayOffset);
    const iso = formatIsoDate(date);
    return { date: iso, day: date.getUTCDate(), inMonth: iso >= range.start && iso <= range.end };
  });
}
