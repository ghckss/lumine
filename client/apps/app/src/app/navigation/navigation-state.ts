import type { AppRoute, PageName } from "./routes";

export const STACK_TRANSITION_MS = 280;

export function createRoute(sequence: number, page: PageName, params?: Record<string, unknown>): AppRoute {
  return { key: `route:${sequence}`, page, params };
}

export function pushRoute(stack: AppRoute[], route: AppRoute): AppRoute[] {
  return [...stack, route];
}

export function popRouteIfTop(stack: AppRoute[], leavingKey: string): AppRoute[] {
  return stack[stack.length - 1]?.key === leavingKey ? stack.slice(0, -1) : stack;
}

export function resetRouteStack(route: AppRoute): AppRoute[] {
  return [route];
}

export function visibleRouteStack(stack: AppRoute[]): AppRoute[] {
  return stack.slice(-2);
}
