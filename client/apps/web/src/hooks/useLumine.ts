"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Route } from "@/lib/Constants";
import {
  clearDataAtom,
  deleteJournalAtom,
  lumineDataAtom,
  notifyAtom,
  renameAtom,
  saveJournalAtom,
  saveScreeningAtom,
} from "@/store/lumineStore";

export function useLumine() {
  const router = useRouter();
  const data = useAtomValue(lumineDataAtom);
  const saveJournal = useSetAtom(saveJournalAtom);
  const deleteJournal = useSetAtom(deleteJournalAtom);
  const saveScreening = useSetAtom(saveScreeningAtom);
  const rename = useSetAtom(renameAtom);
  const clearData = useSetAtom(clearDataAtom);
  const notify = useSetAtom(notifyAtom);
  const navigate = useCallback(
    (next: Route) => router.push(next === "home" ? "/" : `/${next}`),
    [router],
  );

  return {
    data,
    navigate,
    saveJournal,
    deleteJournal,
    saveScreening,
    rename,
    clearData,
    notify,
  };
}
