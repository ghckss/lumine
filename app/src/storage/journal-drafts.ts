import { loadDeviceCache, removeDeviceCache, saveDeviceCache } from "./device-cache";

export type JournalDraft = {
  date: string;
  emotions: string[];
  customEmotions: string[];
  body: string;
  updatedAt: string;
};

export function journalDraftsKey(owner: string) {
  return `journal.drafts.${owner}`;
}

async function loadDrafts(owner: string) {
  return (await loadDeviceCache<Record<string, JournalDraft>>(journalDraftsKey(owner))) ?? {};
}

export async function loadJournalDraft(owner: string, date: string) {
  return (await loadDrafts(owner))[date] ?? null;
}

export async function saveJournalDraft(owner: string, draft: JournalDraft) {
  const drafts = await loadDrafts(owner);
  await saveDeviceCache(journalDraftsKey(owner), { ...drafts, [draft.date]: draft });
}

export async function removeJournalDraft(owner: string, date: string) {
  const drafts = await loadDrafts(owner);
  delete drafts[date];
  if (Object.keys(drafts).length === 0) {
    await removeDeviceCache(journalDraftsKey(owner));
  } else {
    await saveDeviceCache(journalDraftsKey(owner), drafts);
  }
}
