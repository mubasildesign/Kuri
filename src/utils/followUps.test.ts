import { describe, expect, it } from "vitest";
import type { Lead } from "../types";
import {
  buildDashboardQueues,
  buildDashboardStats,
  isDueToday,
  isHotNotContacted,
  isOverdue,
  scopeLeadsByCity,
  todayIsoDate,
} from "./followUps";

function lead(partial: Partial<Lead>): Lead {
  return {
    id: partial.id ?? "1",
    city: partial.city ?? "Trichy",
    name: partial.name ?? "Test Biz",
    category: partial.category ?? "Food & Catering",
    area: partial.area ?? "Cantonment",
    phone: partial.phone ?? "",
    presence: partial.presence ?? "Maps listing only",
    reviews: partial.reviews ?? 40,
    rating: partial.rating ?? 4.2,
    status: partial.status ?? "Not contacted",
    channel: partial.channel ?? "",
    dateContacted: partial.dateContacted ?? "",
    nextFollowUp: partial.nextFollowUp ?? "",
    notes: partial.notes ?? "",
  };
}

describe("todayIsoDate", () => {
  it("formats local calendar date as YYYY-MM-DD", () => {
    expect(todayIsoDate(new Date(2026, 6, 27))).toBe("2026-07-27");
  });
});

describe("isOverdue / isDueToday", () => {
  const today = "2026-07-27";

  it("marks earlier follow-up as overdue", () => {
    expect(isOverdue(lead({ nextFollowUp: "2026-07-20" }), today)).toBe(true);
    expect(isDueToday(lead({ nextFollowUp: "2026-07-20" }), today)).toBe(false);
  });

  it("marks same-day follow-up as due today", () => {
    expect(isDueToday(lead({ nextFollowUp: "2026-07-27" }), today)).toBe(true);
    expect(isOverdue(lead({ nextFollowUp: "2026-07-27" }), today)).toBe(false);
  });

  it("ignores blank or invalid dates", () => {
    expect(isOverdue(lead({ nextFollowUp: "" }), today)).toBe(false);
    expect(isDueToday(lead({ nextFollowUp: "soon" }), today)).toBe(false);
  });

  it("excludes closed statuses from follow-up queues", () => {
    expect(
      isOverdue(lead({ nextFollowUp: "2026-07-01", status: "Won" }), today),
    ).toBe(false);
    expect(
      isDueToday(
        lead({ nextFollowUp: "2026-07-27", status: "Not interested" }),
        today,
      ),
    ).toBe(false);
  });
});

describe("isHotNotContacted", () => {
  it("requires Hot tier and Not contacted", () => {
    // reviews 100 → 5, Maps listing → 4, score 9 → Hot
    expect(
      isHotNotContacted(
        lead({ reviews: 100, presence: "Maps listing only", status: "Not contacted" }),
      ),
    ).toBe(true);
    expect(
      isHotNotContacted(
        lead({ reviews: 100, presence: "Maps listing only", status: "Contacted" }),
      ),
    ).toBe(false);
    expect(
      isHotNotContacted(
        lead({ reviews: 0, presence: "Has modern site", status: "Not contacted" }),
      ),
    ).toBe(false);
  });
});

describe("buildDashboardQueues / stats", () => {
  const today = "2026-07-27";
  const rows = [
    lead({
      id: "a",
      name: "Overdue Shop",
      nextFollowUp: "2026-07-10",
      reviews: 10,
    }),
    lead({
      id: "b",
      name: "Due Today Cafe",
      nextFollowUp: "2026-07-27",
      reviews: 20,
    }),
    lead({
      id: "c",
      name: "Hot Prospect",
      reviews: 100,
      presence: "None",
      status: "Not contacted",
      nextFollowUp: "",
    }),
    lead({
      id: "d",
      name: "Won Deal",
      nextFollowUp: "2026-07-01",
      status: "Won",
      reviews: 100,
      presence: "None",
    }),
    lead({ id: "e", name: "Madurai Lead", city: "Madurai", reviews: 5 }),
  ];

  it("scopes by city", () => {
    expect(scopeLeadsByCity(rows, "Madurai")).toHaveLength(1);
    expect(scopeLeadsByCity(rows, "all")).toHaveLength(5);
  });

  it("builds queues excluding closed leads", () => {
    const queues = buildDashboardQueues(rows, today);
    expect(queues.overdue.map((l) => l.id)).toEqual(["a"]);
    expect(queues.dueToday.map((l) => l.id)).toEqual(["b"]);
    expect(queues.hotNotContacted.map((l) => l.id)).toEqual(["c"]);
  });

  it("builds snapshot stats", () => {
    const stats = buildDashboardStats(rows, today);
    expect(stats.total).toBe(5);
    expect(stats.overdue).toBe(1);
    expect(stats.dueToday).toBe(1);
    expect(stats.notContacted).toBe(4); // a,b,c,e
    expect(stats.hot).toBeGreaterThanOrEqual(1);
  });
});
