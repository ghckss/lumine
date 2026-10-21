import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createRoute,
  popRouteIfTop,
  pushRoute,
  resetRouteStack,
  STACK_TRANSITION_MS
} from "./navigation-state";
import type { AppRoute, PageName } from "./routes";

export type NavigationContextValue = {
  route: AppRoute;
  stack: AppRoute[];
  backTransitionKey: string | null;
  navigate: (page: PageName, params?: Record<string, unknown>) => void;
  goBack: () => void;
  resetTo: (page: PageName, params?: Record<string, unknown>) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);
const AppRouteContext = createContext<AppRoute | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const routeSequence = useRef(0);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stack, setStack] = useState<AppRoute[]>([{ key: "route:0", page: "home" }]);
  const [backTransitionKey, setBackTransitionKey] = useState<string | null>(null);

  const nextRoute = useCallback((page: PageName, params?: Record<string, unknown>) => {
    routeSequence.current += 1;
    return createRoute(routeSequence.current, page, params);
  }, []);

  const navigate = useCallback((page: PageName, params?: Record<string, unknown>) => {
    setStack((current) => pushRoute(current, nextRoute(page, params)));
  }, [nextRoute]);

  const goBack = useCallback(() => {
    if (stack.length <= 1 || backTransitionKey) return;
    const leavingKey = stack[stack.length - 1].key;
    setBackTransitionKey(leavingKey);
    popTimer.current = setTimeout(() => {
      setStack((current) => popRouteIfTop(current, leavingKey));
      setBackTransitionKey(null);
      popTimer.current = null;
    }, STACK_TRANSITION_MS);
  }, [backTransitionKey, stack]);

  const resetTo = useCallback((page: PageName, params?: Record<string, unknown>) => {
    setStack(resetRouteStack(nextRoute(page, params)));
  }, [nextRoute]);

  useEffect(() => () => {
    if (popTimer.current) clearTimeout(popTimer.current);
  }, []);

  const value = useMemo<NavigationContextValue>(() => ({
    route: stack[stack.length - 1],
    stack,
    backTransitionKey,
    navigate,
    goBack,
    resetTo
  }), [backTransitionKey, goBack, navigate, resetTo, stack]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  const scopedRoute = useContext(AppRouteContext);
  if (!context) throw new Error("useNavigation must be used within NavigationProvider");
  return scopedRoute ? { ...context, route: scopedRoute } : context;
}

export function AppRouteScope({ route, children }: { route: AppRoute; children: React.ReactNode }) {
  return <AppRouteContext.Provider value={route}>{children}</AppRouteContext.Provider>;
}
