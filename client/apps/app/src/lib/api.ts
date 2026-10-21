import { accountApi } from "../features/account/api/account-api";
import { authApi } from "../features/auth/api/auth-api";
import { journalApi } from "../features/journal/api/journal-api";
import { screeningApi } from "../features/screening";
import { supportApi } from "../features/support/api/support-api";

export { configureApiAccessToken } from "../shared/api/http-client";
export { toJournalRecord } from "../features/journal/api/journal-api";

/** @deprecated Import the owning feature API directly in migrated modules. */
export const api = {
  ...authApi,
  ...accountApi,
  ...journalApi,
  ...screeningApi,
  ...supportApi
};
