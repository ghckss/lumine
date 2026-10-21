import { describe, expect, it } from "vitest";
import {
  createRoute,
  popRouteIfTop,
  pushRoute,
  resetRouteStack,
  STACK_TRANSITION_MS,
  visibleRouteStack
} from "./navigation-state";

describe("navigation state", () => {
  it("preserves stable route keys and params", () => {
    expect(createRoute(0, "home")).toEqual({ key: "route:0", page: "home" });
    expect(createRoute(3, "record-detail", { date: "2026-10-21" })).toEqual({
      key: "route:3",
      page: "record-detail",
      params: { date: "2026-10-21" }
    });
  });

  it("pushes and resets without mutating the current stack", () => {
    const home = createRoute(0, "home");
    const diary = createRoute(1, "diary");
    const current = [home];

    expect(pushRoute(current, diary)).toEqual([home, diary]);
    expect(current).toEqual([home]);
    expect(resetRouteStack(diary)).toEqual([diary]);
  });

  it("only pops when the leaving route is still on top", () => {
    const home = createRoute(0, "home");
    const diary = createRoute(1, "diary");
    const menu = createRoute(2, "menu");

    expect(popRouteIfTop([home, diary], diary.key)).toEqual([home]);
    expect(popRouteIfTop([home, diary, menu], diary.key)).toEqual([home, diary, menu]);
  });

  it("keeps only the two visible navigation layers", () => {
    const routes = [createRoute(0, "home"), createRoute(1, "diary"), createRoute(2, "menu")];
    expect(visibleRouteStack(routes)).toEqual(routes.slice(1));
    expect(visibleRouteStack(routes.slice(0, 1))).toEqual(routes.slice(0, 1));
  });

  it("retains the established back transition duration", () => {
    expect(STACK_TRANSITION_MS).toBe(280);
  });
});
