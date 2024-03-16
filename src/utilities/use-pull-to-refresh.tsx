import { useEffect, useRef, useState } from "react";

export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  pullMaxLength = 100,
  pullThreshold = 100
) => {
  const pullStartPosition = useRef(0);
  const [pullPosition, setPullPosition] = useState(0);
  const pullPositionRef = useRef(0);
  pullPositionRef.current = pullPosition
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pullStart = ({ targetTouches }: TouchEvent) => {
      const touch = targetTouches[0];
      if (!touch) return

      pullStartPosition.current = touch.screenY;
    }

    const pulling = ({ targetTouches }: TouchEvent) => {
      const touch = targetTouches[0];
      if (!touch) return;

      const currentPullLength = pullStartPosition.current < touch.screenY
        ? Math.min(Math.abs(touch.screenY - pullStartPosition.current), pullMaxLength)
        : 0;
      setPullPosition(currentPullLength)
    }

    const endPull = () => {
      const shouldRefreshing = pullPositionRef.current >= pullThreshold
      pullStartPosition.current = 0;
      setPullPosition(0)
      if (!shouldRefreshing) return;

      setIsRefreshing(true);
      setTimeout(async () => {
        await onRefresh();
        setIsRefreshing(false);
      }, 500);
    }

    window.addEventListener('touchstart', pullStart, { passive: true });
    window.addEventListener('touchmove', pulling, { passive: true });
    window.addEventListener('touchend', endPull, { passive: true });

    return () => {
      window.removeEventListener('touchstart', pullStart);
      window.removeEventListener('touchmove', pulling);
      window.removeEventListener('touchend', endPull);
    };
  });

  return { isRefreshing, pullPosition }
}