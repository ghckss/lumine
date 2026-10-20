"use client";

import { useAtomValue } from "jotai";
import { lumineDataAtom } from "@/store/lumineStore";

export function StorageHydrator() {
  useAtomValue(lumineDataAtom);
  return null;
}
