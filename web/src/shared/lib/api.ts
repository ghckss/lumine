import {
  mockGetJournalEntry,
  mockGetJournalEntries,
  mockGetLatestScreeningResult,
  mockGetQuestionnaire,
  mockGetSupportResources,
  mockLogin,
  mockSaveJournalEntry,
  mockSignup,
  mockSubmitScreening
} from "./mock-api";
import type { AuthProvider, JournalEntryPayload, ScreeningSubmission, SignupPayload } from "@/shared/types/domain";

export const api = {
  auth: {
    login: (provider: AuthProvider) => mockLogin(provider),
    signup: (payload: SignupPayload) => mockSignup(payload)
  },
  screening: {
    getQuestionnaire: () => mockGetQuestionnaire(),
    getLatestResult: () => mockGetLatestScreeningResult(),
    submit: (payload: ScreeningSubmission) => mockSubmitScreening(payload)
  },
  journal: {
    getEntry: (date: string) => mockGetJournalEntry(date),
    getEntries: (limit?: number) => mockGetJournalEntries(limit),
    saveEntry: (payload: JournalEntryPayload) => mockSaveJournalEntry(payload)
  },
  support: {
    getResources: () => mockGetSupportResources()
  }
};
