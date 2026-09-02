import { describe, expect, it } from "vitest";
import { createUserDataExportFileName, serializeUserDataExport } from "./data-export-format";
import type { UserDataExport } from "./api";

describe("data export formatting", () => {
  it("creates a filesystem-safe JSON filename", () => {
    expect(createUserDataExportFileName(new Date("2026-09-03T01:02:03.456Z")))
      .toBe("lumine-data-2026-09-03T01-02-03-456Z.json");
  });

  it("preserves Korean content in readable UTF-8 JSON text", () => {
    const data = {
      schemaVersion: "2026-09-01",
      exportedAt: "2026-09-03T00:00:00Z",
      profile: { userId: "user", provider: "KAKAO", displayName: "하린", gender: null, birthDate: null, agreedToTerms: true, signedUpAt: null },
      journals: [],
      screenings: []
    } as UserDataExport;

    const serialized = serializeUserDataExport(data);
    expect(serialized).toContain('"displayName": "하린"');
    expect(serialized.endsWith("\n")).toBe(true);
  });
});
