import { describe, expect, it } from "vitest";

import { reputationList } from "@/lib/demo-data";
import { normalizePhone } from "@/lib/risk";

describe("number lookup", () => {
  it("matches a reported number however it is typed", () => {
    const typed = ["+1 (312) 555-0187", "312-555-0187", "13125550187"];
    for (const t of typed) {
      expect(reputationList.some((r) => r.number === normalizePhone(t))).toBe(true);
    }
  });
});
