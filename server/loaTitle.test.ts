import { describe, expect, it } from "vitest";
import { buildDefaultLoaTitle, resolveLoaTitle } from "../shared/loaTitle";

describe("LOA title defaults", () => {
  const date = new Date(2026, 7, 25, 9, 5);

  it("uses the requested employee-contract-date-time default format", () => {
    expect(buildDefaultLoaTitle("Veronica Chen", date)).toBe("Veronica Chen_Employment Contract_2026-08-25_09-05");
  });

  it("uses an employee fallback until the name is entered", () => {
    expect(buildDefaultLoaTitle("", date)).toBe("Employee_Employment Contract_2026-08-25_09-05");
  });

  it("retains a manually edited title instead of overwriting it", () => {
    expect(resolveLoaTitle({ currentTitle: "Custom LOA name", wasManuallyEdited: true, employeeFullName: "Veronica Chen", date })).toBe("Custom LOA name");
  });
});
