import { useEffect, useRef, useState } from "react";
import { PullToRefreshState } from "../types/pull-to-refresh-state";

export const usePullToRefresh = <T extends HTMLElement>({
  onRefresh,
  startMin = 100,
  maxLength = 100,
  threshold = 100,
  useWindow = true,
}: {
  onRefresh: () => Promise<void>
  startMin?: number
  maxLength?: number
  threshold?: number
  useWindow?: boolean
}) => {
  const element = useRef<T>(null);
  const pullStartPosition = useRef(0);
  const [pullPosition, setPullPosition] = useState(0);
  const pullPositionRef = useRef(0);
  pullPositionRef.current = pullPosition
  const [state, setState] = useState<PullToRefreshState>(PullToRefreshState.stale);

  useEffect(() => {
    if (state == PullToRefreshState.loading) {
      (async () => {
        await onRefresh();
        setState(PullToRefreshState.stale)
      })()
    }
  }, [state])

  const getElement = () => !useWindow
    ? element.current?.parentElement
    : (typeof window === 'undefined' ? null : window)

  useEffect(() => {
    const el = getElement()
    if (!el) return

    const pullStart = ({ targetTouches }: TouchEvent) => {
      const touch = targetTouches[0];
      if (!touch) return

      const scrollY = useWindow
        ? window.scrollY
        : (element.current?.parentElement?.scrollTop || 0)
      console.log(scrollY)
      if (scrollY < startMin)
        pullStartPosition.current = touch.screenY;
    }

    const pulling = ({ targetTouches }: TouchEvent) => {
      const touch = targetTouches[0];
      if (!touch || pullStartPosition.current == 0) return;

      const currentPullLength = pullStartPosition.current < touch.screenY
        ? Math.min(Math.abs(touch.screenY - pullStartPosition.current), maxLength)
        : 0;
      setPullPosition(currentPullLength)
    }

    const endPull = () => {
      const shouldRefreshing = pullPositionRef.current >= threshold
      pullStartPosition.current = 0;
      setPullPosition(0)
      if (!shouldRefreshing) return;

      setState(PullToRefreshState.loading);
    }

    el.addEventListener('touchstart', pullStart as any, { passive: true });
    el.addEventListener('touchmove', pulling as any, { passive: true });
    el.addEventListener('touchend', endPull, { passive: true });

    return () => {
      el.removeEventListener('touchstart', pullStart as any);
      el.removeEventListener('touchmove', pulling as any);
      el.removeEventListener('touchend', endPull);
    };
  });

  return { state, pullPosition, element }
}