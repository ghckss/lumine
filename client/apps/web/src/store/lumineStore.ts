import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { comfortMessage } from "@/lib/Constants";
import type { Emotion, Journal, Screening, UserData } from "@/lib/Constants";

const STORAGE_KEY = "lumine.web.v1";

export const defaultLumineData: UserData = {
  journals: [],
  screenings: [],
  name: "루민",
};

const browserStorage = createJSONStorage<UserData>(() => localStorage);

export const lumineDataAtom = atomWithStorage(STORAGE_KEY, defaultLumineData, browserStorage, {
  getOnInit: false,
});

export const toastAtom = atom("");

export const saveJournalAtom = atom(
  null,
  (_get, set, input: { date: string; emotions: Emotion[]; body: string }) => {
    const record: Journal = {
      id: `journal:${input.date}`,
      ...input,
      comfortMessage: comfortMessage(input.emotions),
      createdAt: new Date().toISOString(),
    };

    set(lumineDataAtom, (current) => ({
      ...current,
      journals: [record, ...current.journals.filter((item) => item.date !== input.date)].sort(
        (a, b) => b.date.localeCompare(a.date),
      ),
    }));
    set(toastAtom, "오늘의 마음을 소중히 담아두었어요.");
  },
);

export const deleteJournalAtom = atom(null, (_get, set, id: string) => {
  set(lumineDataAtom, (current) => ({
    ...current,
    journals: current.journals.filter((item) => item.id !== id),
  }));
  set(toastAtom, "기록을 삭제했어요.");
});

export const saveScreeningAtom = atom(null, (_get, set, input: Omit<Screening, "id" | "date">) => {
  const screening: Screening = {
    id: `screening:${Date.now()}`,
    date: new Date().toISOString(),
    ...input,
  };
  set(lumineDataAtom, (current) => ({
    ...current,
    screenings: [screening, ...current.screenings],
  }));
  return screening;
});

export const renameAtom = atom(null, (_get, set, name: string) => {
  set(lumineDataAtom, (current) => ({
    ...current,
    name: name.trim().slice(0, 12),
  }));
});

export const clearDataAtom = atom(null, (_get, set) => {
  set(lumineDataAtom, (current) => ({ ...current, journals: [], screenings: [] }));
  set(toastAtom, "모든 기록을 지웠어요.");
});

export const notifyAtom = atom(null, (_get, set, message: string) => {
  set(toastAtom, message);
});
